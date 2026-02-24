export type ContextFilterType =
	| 'directory'
	| 'tag'
	| 'frontmatter-key'
	| 'frontmatter-value';

export interface ContextFilter {
	type: ContextFilterType;
	value: string;
}

export interface Context {
	id: string;
	name: string;
	filters: ContextFilter[];
}

export interface ContextsSettings {
	contexts: Context[];
}
