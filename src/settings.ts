import { App, PluginSettingTab } from 'obsidian';
import type ContextsPlugin from './main';
import type { ContextsSettings } from './types';

export type { ContextsSettings };
export type { Context, ContextFilter, ContextFilterType } from './types';

export const DEFAULT_SETTINGS: ContextsSettings = {
	contexts: [],
};

export class ContextsSettingTab extends PluginSettingTab {
	plugin: ContextsPlugin;

	constructor(app: App, plugin: ContextsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();
		// Settings UI — to be implemented
	}
}
