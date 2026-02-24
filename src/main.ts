import { Plugin } from 'obsidian';
import { ContextsSettings, DEFAULT_SETTINGS, ContextsSettingTab } from './settings';

export default class ContextsPlugin extends Plugin {
	settings: ContextsSettings;
	activeContextId: string | null = null;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ContextsSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<ContextsSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
