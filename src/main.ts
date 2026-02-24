import { Plugin } from 'obsidian';
import { ContextsSettings, DEFAULT_SETTINGS, ContextsSettingTab } from './settings';
import { ContextsView, VIEW_TYPE_CONTEXTS } from './views/contexts-view';

export default class ContextsPlugin extends Plugin {
	settings: ContextsSettings;
	activeContextId: string | null = null;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ContextsSettingTab(this.app, this));

		this.registerView(
			VIEW_TYPE_CONTEXTS,
			(leaf) => new ContextsView(leaf, this)
		);

		this.addRibbonIcon('folder-open', 'Contexts', () => {
			this.activateView();
		});

		this.registerEvent(this.app.vault.on('create', () => this.refreshView()));
		this.registerEvent(this.app.vault.on('delete', () => this.refreshView()));
		this.registerEvent(this.app.vault.on('rename', () => this.refreshView()));
	}

	onunload() {}

	async activateView() {
		const { workspace } = this.app;
		let leaf = workspace.getLeavesOfType(VIEW_TYPE_CONTEXTS)[0];
		if (!leaf) {
			leaf = workspace.getLeftLeaf(false) ?? workspace.getLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE_CONTEXTS, active: true });
		}
		await workspace.revealLeaf(leaf);
	}

	refreshView() {
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_CONTEXTS)) {
			if (leaf.view instanceof ContextsView) leaf.view.render();
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<ContextsSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
