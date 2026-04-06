#!/usr/bin/env node

/**
 * Fitness Test: Moves & Games
 *
 * Validates that the Moves/Games data model works correctly:
 * - Move CRUD (create, read, update, list)
 * - Game CRUD (create, read, update, list)
 * - Move ↔ Game association (including retroactive linking)
 * - Activity feed records move/game events
 * - Commit linking to moves
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  withStartedServer,
  authedPost,
  authedPatch,
  authedGet,
  getDoc,
  createMove,
  createGame,
} from '../support/resources.js'

describe('moves', () => {
  it('creates a move with all fields', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/move', {
        title: 'Implement login flow',
        description: 'Build the OAuth integration',
        branch: 'feat/login',
        agent: 'friday',
      })

      assert.ok(result.success)
      assert.ok(result.moveId)

      const doc = await getDoc(server)
      const move = doc.moves[result.moveId]

      assert.equal(move.title, 'Implement login flow')
      assert.equal(move.description, 'Build the OAuth integration')
      assert.equal(move.branch, 'feat/login')
      assert.equal(move.status, 'proposed')
      assert.equal(move.agent, 'friday')
      assert.equal(move.gameId, null)
      assert.ok(move.created_at)
      assert.ok(move.updated_at)
    })
  })

  it('creates a move linked to a game', async () => {
    await withStartedServer({}, async server => {
      const gameId = await createGame(server)
      const moveId = await createMove(server, {
        title: 'First move',
        gameId,
      })

      const doc = await getDoc(server)
      assert.equal(doc.moves[moveId].gameId, gameId)
    })
  })

  it('rejects move creation with non-existent game', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/move', {
        title: 'Bad move',
        gameId: 'game-doesnotexist',
      })

      assert.equal(result.status, 404)
    })
  })

  it('requires title for move creation', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/move', {
        description: 'no title',
      })

      assert.equal(result.status, 400)
    })
  })

  it('updates move fields', async () => {
    await withStartedServer({}, async server => {
      const moveId = await createMove(server)

      const result = await authedPatch(server, `/automerge/move/${moveId}`, {
        status: 'active',
        branch: 'feat/new-branch',
        agent: 'gary',
      })

      assert.ok(result.success)
      assert.ok(result.changes.length >= 1)

      const doc = await getDoc(server)
      assert.equal(doc.moves[moveId].status, 'active')
      assert.equal(doc.moves[moveId].branch, 'feat/new-branch')
    })
  })

  it('retroactively links a move to a game', async () => {
    await withStartedServer({}, async server => {
      const moveId = await createMove(server, { title: 'Orphan move' })
      const gameId = await createGame(server)

      // Move starts unlinked
      let doc = await getDoc(server)
      assert.equal(doc.moves[moveId].gameId, null)

      // Retroactively link
      await authedPatch(server, `/automerge/move/${moveId}`, {
        gameId,
        agent: 'gary',
      })

      doc = await getDoc(server)
      assert.equal(doc.moves[moveId].gameId, gameId)
    })
  })

  it('lists moves with filters', async () => {
    await withStartedServer({}, async server => {
      const gameId = await createGame(server)

      await createMove(server, { title: 'Move A', gameId, agent: 'friday' })
      await createMove(server, { title: 'Move B', agent: 'gary' })

      // All moves
      const all = await authedGet(server, '/automerge/moves')
      assert.equal(all.moves.length, 2)

      // Filter by game
      const byGame = await authedGet(server, `/automerge/moves?gameId=${gameId}`)
      assert.equal(byGame.moves.length, 1)
      assert.equal(byGame.moves[0].title, 'Move A')

      // Filter by agent
      const byAgent = await authedGet(server, '/automerge/moves?agent=gary')
      assert.equal(byAgent.moves.length, 1)
      assert.equal(byAgent.moves[0].title, 'Move B')
    })
  })

  it('gets a single move by ID', async () => {
    await withStartedServer({}, async server => {
      const moveId = await createMove(server, { title: 'Specific move' })

      const data = await authedGet(server, `/automerge/move/${moveId}`)
      assert.ok(data.success)
      assert.equal(data.move.title, 'Specific move')
    })
  })

  it('returns 404 for non-existent move', async () => {
    await withStartedServer({}, async server => {
      const res = await authedGet(server, '/automerge/move/move-doesnotexist')
      assert.equal(res.error, 'Move move-doesnotexist not found')
    })
  })

  it('move status lifecycle: proposed → active → completed', async () => {
    await withStartedServer({}, async server => {
      const moveId = await createMove(server)

      for (const status of ['active', 'completed']) {
        const result = await authedPatch(server, `/automerge/move/${moveId}`, {
          status,
          agent: 'gary',
        })
        assert.ok(result.success)
      }

      const doc = await getDoc(server)
      assert.equal(doc.moves[moveId].status, 'completed')
    })
  })

  it('links a commit to a move', async () => {
    await withStartedServer({}, async server => {
      const moveId = await createMove(server)

      const result = await authedPost(server, `/automerge/move/${moveId}/commit`, {
        commit: {
          hash: 'abc123def456',
          message: 'feat: implement the thing',
        },
        agent: 'friday',
      })

      assert.ok(result.success)

      const doc = await getDoc(server)
      const commitActivity = doc.activity.find(
        a => a.type === 'commit_linked' && a.moveId === moveId
      )
      assert.ok(commitActivity, 'Should have commit_linked activity for move')
      assert.equal(commitActivity.commitHash, 'abc123def456')
    })
  })

  it('activity feed records move creation', async () => {
    await withStartedServer({}, async server => {
      const moveId = await createMove(server, { agent: 'gary' })

      const doc = await getDoc(server)
      const creation = doc.activity.find(
        a => a.type === 'move_created' && a.moveId === moveId
      )

      assert.ok(creation, 'Should have move_created activity')
      assert.equal(creation.agent, 'gary')
    })
  })

  it('activity feed records move updates', async () => {
    await withStartedServer({}, async server => {
      const moveId = await createMove(server)

      await authedPatch(server, `/automerge/move/${moveId}`, {
        status: 'active',
        agent: 'gary',
      })

      const doc = await getDoc(server)
      const update = doc.activity.find(
        a => a.type === 'move_updated' && a.moveId === moveId
      )

      assert.ok(update, 'Should have move_updated activity')
      assert.equal(update.agent, 'gary')
    })
  })
})

describe('games', () => {
  it('creates a game with all fields', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/game', {
        title: 'Auth System Overhaul',
        description: 'Replace legacy auth with OAuth2',
        endgame: 'All users authenticate via OAuth2 with zero legacy fallback',
        agent: 'gary',
      })

      assert.ok(result.success)
      assert.ok(result.gameId)

      const doc = await getDoc(server)
      const game = doc.games[result.gameId]

      assert.equal(game.title, 'Auth System Overhaul')
      assert.equal(game.description, 'Replace legacy auth with OAuth2')
      assert.equal(game.endgame, 'All users authenticate via OAuth2 with zero legacy fallback')
      assert.equal(game.status, 'active')
      assert.equal(game.agent, 'gary')
      assert.ok(game.created_at)
    })
  })

  it('requires title for game creation', async () => {
    await withStartedServer({}, async server => {
      const result = await authedPost(server, '/automerge/game', {
        endgame: 'Some goal',
      })

      assert.equal(result.status, 400)
    })
  })

  it('updates game fields', async () => {
    await withStartedServer({}, async server => {
      const gameId = await createGame(server)

      const result = await authedPatch(server, `/automerge/game/${gameId}`, {
        status: 'won',
        endgame: 'Updated endgame',
        agent: 'gary',
      })

      assert.ok(result.success)

      const doc = await getDoc(server)
      assert.equal(doc.games[gameId].status, 'won')
      assert.equal(doc.games[gameId].endgame, 'Updated endgame')
    })
  })

  it('gets a game with its moves', async () => {
    await withStartedServer({}, async server => {
      const gameId = await createGame(server, { title: 'The Grand Game' })
      await createMove(server, { title: 'Move 1', gameId })
      await createMove(server, { title: 'Move 2', gameId })
      await createMove(server, { title: 'Unrelated move' }) // no game

      const data = await authedGet(server, `/automerge/game/${gameId}`)
      assert.ok(data.success)
      assert.equal(data.game.title, 'The Grand Game')
      assert.equal(data.moves.length, 2)
    })
  })

  it('returns 404 for non-existent game', async () => {
    await withStartedServer({}, async server => {
      const res = await authedGet(server, '/automerge/game/game-doesnotexist')
      assert.equal(res.error, 'Game game-doesnotexist not found')
    })
  })

  it('lists games with status filter', async () => {
    await withStartedServer({}, async server => {
      const g1 = await createGame(server, { title: 'Active game' })
      const g2 = await createGame(server, { title: 'Won game' })

      await authedPatch(server, `/automerge/game/${g2}`, {
        status: 'won',
        agent: 'gary',
      })

      const active = await authedGet(server, '/automerge/games?status=active')
      assert.equal(active.games.length, 1)
      assert.equal(active.games[0].title, 'Active game')

      const won = await authedGet(server, '/automerge/games?status=won')
      assert.equal(won.games.length, 1)
      assert.equal(won.games[0].title, 'Won game')
    })
  })

  it('game status lifecycle: active → paused → active → won', async () => {
    await withStartedServer({}, async server => {
      const gameId = await createGame(server)

      for (const status of ['paused', 'active', 'won']) {
        const result = await authedPatch(server, `/automerge/game/${gameId}`, {
          status,
          agent: 'gary',
        })
        assert.ok(result.success)
      }

      const doc = await getDoc(server)
      assert.equal(doc.games[gameId].status, 'won')
    })
  })

  it('activity feed records game creation', async () => {
    await withStartedServer({}, async server => {
      const gameId = await createGame(server, { agent: 'gary' })

      const doc = await getDoc(server)
      const creation = doc.activity.find(
        a => a.type === 'game_created' && a.gameId === gameId
      )

      assert.ok(creation, 'Should have game_created activity')
      assert.equal(creation.agent, 'gary')
    })
  })

  it('activity feed records game updates', async () => {
    await withStartedServer({}, async server => {
      const gameId = await createGame(server)

      await authedPatch(server, `/automerge/game/${gameId}`, {
        status: 'won',
        agent: 'gary',
      })

      const doc = await getDoc(server)
      const update = doc.activity.find(
        a => a.type === 'game_updated' && a.gameId === gameId
      )

      assert.ok(update, 'Should have game_updated activity')
      assert.equal(update.agent, 'gary')
    })
  })
})

describe('moves and games integration', () => {
  it('multiple games can share moves toward the same endgame', async () => {
    await withStartedServer({}, async server => {
      const g1 = await createGame(server, {
        title: 'Strategy A',
        endgame: 'Ship the feature',
      })
      const g2 = await createGame(server, {
        title: 'Strategy B',
        endgame: 'Ship the feature',
      })

      await createMove(server, { title: 'Move for A', gameId: g1 })
      await createMove(server, { title: 'Move for B', gameId: g2 })

      const dataA = await authedGet(server, `/automerge/game/${g1}`)
      const dataB = await authedGet(server, `/automerge/game/${g2}`)

      assert.equal(dataA.moves.length, 1)
      assert.equal(dataB.moves.length, 1)
      assert.equal(dataA.game.endgame, dataB.game.endgame)
    })
  })

  it('a move can be reassigned between games', async () => {
    await withStartedServer({}, async server => {
      const g1 = await createGame(server, { title: 'Game 1' })
      const g2 = await createGame(server, { title: 'Game 2' })

      const moveId = await createMove(server, { title: 'Moveable', gameId: g1 })

      // Move starts in game 1
      let data = await authedGet(server, `/automerge/game/${g1}`)
      assert.equal(data.moves.length, 1)

      // Reassign to game 2
      await authedPatch(server, `/automerge/move/${moveId}`, {
        gameId: g2,
        agent: 'gary',
      })

      data = await authedGet(server, `/automerge/game/${g1}`)
      assert.equal(data.moves.length, 0)

      data = await authedGet(server, `/automerge/game/${g2}`)
      assert.equal(data.moves.length, 1)
    })
  })
})
