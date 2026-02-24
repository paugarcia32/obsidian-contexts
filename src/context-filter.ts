import { TFile, MetadataCache } from 'obsidian';
import type { Context, ContextFilter } from './types';

/**
 * Returns the subset of `files` that match every filter in `context` (AND logic).
 * If the context has no filters, all files are returned.
 */
export function filterFiles(
	context: Context,
	files: TFile[],
	metadataCache: MetadataCache,
): TFile[] {
	if (context.filters.length === 0) return files.slice();
	return files.filter(file =>
		context.filters.every(filter => matchesFilter(file, filter, metadataCache))
	);
}

function matchesFilter(
	file: TFile,
	filter: ContextFilter,
	metadataCache: MetadataCache,
): boolean {
	switch (filter.type) {
		case 'directory':         return matchesDirectory(file, filter.value);
		case 'tag':               return matchesTag(file, filter.value, metadataCache);
		case 'frontmatter-key':   return matchesFrontmatterKey(file, filter.value, metadataCache);
		case 'frontmatter-value': return matchesFrontmatterValue(file, filter.value, metadataCache);
	}
}

function matchesDirectory(file: TFile, raw: string): boolean {
	const dir = raw.replace(/^\/+|\/+$/g, ''); // strip leading/trailing slashes
	return file.path === dir || file.path.startsWith(dir + '/');
}

function matchesTag(
	file: TFile,
	raw: string,
	metadataCache: MetadataCache,
): boolean {
	const needle = raw.startsWith('#') ? raw : `#${raw}`;
	const cache = metadataCache.getFileCache(file);

	// Check inline tags
	const inlineMatch = cache?.tags?.some(t => t.tag === needle) ?? false;
	if (inlineMatch) return true;

	// Check frontmatter tags array
	const fmTags: unknown = cache?.frontmatter?.['tags'];
	if (!Array.isArray(fmTags)) return false;
	return fmTags.some(t => {
		if (typeof t !== 'string') return false;
		return (t.startsWith('#') ? t : `#${t}`) === needle;
	});
}

function matchesFrontmatterKey(
	file: TFile,
	key: string,
	metadataCache: MetadataCache,
): boolean {
	const cache = metadataCache.getFileCache(file);
	return key in (cache?.frontmatter ?? {});
}

function matchesFrontmatterValue(
	file: TFile,
	raw: string,
	metadataCache: MetadataCache,
): boolean {
	// Split on first '=' only — allows values like "url=https://example.com/a=b"
	const eqIdx = raw.indexOf('=');
	if (eqIdx === -1) return false;
	const key = raw.slice(0, eqIdx);
	const val = raw.slice(eqIdx + 1);
	const cache = metadataCache.getFileCache(file);
	const fmVal = cache?.frontmatter?.[key];
	// Coerce to string so numeric frontmatter values (e.g. priority: 1) match "1"
	return fmVal !== undefined && String(fmVal) === val;
}
