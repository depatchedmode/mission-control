import type { LegacyDocumentId, AutomergeUrl, BinaryDocumentId, DocumentId, AnyDocumentId, UrlHeads } from "./types.js";
import type { Heads as AutomergeHeads } from "@automerge/automerge/slim";
export declare const urlPrefix = "automerge:";
interface ParsedAutomergeUrl {
    /** unencoded DocumentId */
    binaryDocumentId: BinaryDocumentId;
    /** bs58 encoded DocumentId */
    documentId: DocumentId;
    /** Optional array of heads, if specified in URL */
    heads?: UrlHeads;
    /** Optional hex array of heads, in Automerge core format */
    hexHeads?: string[];
}
/** Given an Automerge URL, returns the DocumentId in both base58check-encoded form and binary form */
export declare const parseAutomergeUrl: (url: AutomergeUrl) => ParsedAutomergeUrl;
/**
 * Given a documentId in either binary or base58check-encoded form, returns an Automerge URL.
 * Throws on invalid input.
 */
export declare const stringifyAutomergeUrl: (arg: UrlOptions | DocumentId | BinaryDocumentId) => AutomergeUrl;
/** Helper to extract just the heads from a URL if they exist */
export declare const getHeadsFromUrl: (url: AutomergeUrl) => string[] | undefined;
export declare const anyDocumentIdToAutomergeUrl: (id: AnyDocumentId) => AutomergeUrl | undefined;
/**
 * Given a string, returns true if it is a valid Automerge URL. This function also acts as a type
 * discriminator in Typescript.
 */
export declare const isValidAutomergeUrl: (str: unknown) => str is AutomergeUrl;
export declare const isValidDocumentId: (str: unknown) => str is DocumentId;
export declare const isValidUuid: (str: unknown) => str is LegacyDocumentId;
/**
 * Returns a new Automerge URL with a random UUID documentId. Called by Repo.create(), and also used by tests.
 */
export declare const generateAutomergeUrl: () => AutomergeUrl;
export declare const documentIdToBinary: (docId: DocumentId) => BinaryDocumentId | undefined;
export declare const binaryToDocumentId: (docId: BinaryDocumentId) => DocumentId;
export declare const encodeHeads: (heads: AutomergeHeads) => UrlHeads;
export declare const decodeHeads: (heads: UrlHeads) => AutomergeHeads;
export declare const parseLegacyUUID: (str: string) => AutomergeUrl | undefined;
/**
 * Given any valid expression of a document ID, returns a DocumentId in base58check-encoded form.
 *
 * Currently supports:
 * - base58check-encoded DocumentId
 * - Automerge URL
 * - legacy UUID
 * - binary DocumentId
 *
 * Throws on invalid input.
 */
export declare const interpretAsDocumentId: (id: AnyDocumentId) => DocumentId;
type UrlOptions = {
    documentId: DocumentId | BinaryDocumentId;
    heads?: UrlHeads;
};
export {};
//# sourceMappingURL=AutomergeUrl.d.ts.map