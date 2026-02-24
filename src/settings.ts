import { App, PluginSettingTab, Setting } from 'obsidian';
import type ContextsPlugin from './main';
import type { ContextsSettings, ContextFilterType } from './types';

export type { ContextsSettings };
export type { Context, ContextFilter, ContextFilterType } from './types';

export const DEFAULT_SETTINGS: ContextsSettings = {
	contexts: [],
};

function generateId(): string {
	return Math.random().toString(36).slice(2, 9);
}

export class ContextsSettingTab extends PluginSettingTab {
	plugin: ContextsPlugin;

	constructor(app: App, plugin: ContextsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// ── "Add context" button at the top ──────────────────────────
		new Setting(containerEl)
			.setName('Contexts')
			.setDesc('Define the contexts available in your vault.')
			.addButton(btn => btn
				.setButtonText('+ Add context')
				.setCta()
				.onClick(async () => {
					this.plugin.settings.contexts.push({
						id: generateId(),
						name: 'New context',
						filters: [],
					});
					await this.plugin.saveSettings();
					this.display();
				}));

		// ── One section per context ───────────────────────────────────
		for (const context of this.plugin.settings.contexts) {
			// Section heading + Delete button
			new Setting(containerEl)
				.setHeading()
				.setName(context.name)
				.addButton(btn => btn
					.setButtonText('Delete')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.contexts =
							this.plugin.settings.contexts.filter(c => c.id !== context.id);
						await this.plugin.saveSettings();
						this.display();
					}));

			// Name field
			new Setting(containerEl)
				.setName('Name')
				.addText(text => text
					.setValue(context.name)
					.onChange(async (value) => {
						context.name = value;
						await this.plugin.saveSettings();
					}));

			// Existing filters
			for (const filter of context.filters) {
				new Setting(containerEl)
					.setName(filter.type)
					.setDesc(filter.value)
					.addButton(btn => btn
						.setButtonText('Remove')
						.onClick(async () => {
							context.filters = context.filters.filter(f => f !== filter);
							await this.plugin.saveSettings();
							this.display();
						}));
			}

			// "Add filter" row: type selector + value input + Add button
			let newFilterType: ContextFilterType = 'directory';
			let newFilterValue = '';

			const addFilterSetting = new Setting(containerEl)
				.setName('Add filter');

			addFilterSetting.addDropdown(drop => drop
				.addOption('directory',         'Directory')
				.addOption('tag',               'Tag')
				.addOption('frontmatter-key',   'Frontmatter key')
				.addOption('frontmatter-value', 'Frontmatter value')
				.setValue(newFilterType)
				.onChange(value => { newFilterType = value as ContextFilterType; }));

			addFilterSetting.addText(text => text
				.setPlaceholder('value')
				.onChange(value => { newFilterValue = value; }));

			addFilterSetting.addButton(btn => btn
				.setButtonText('Add')
				.onClick(async () => {
					const v = newFilterValue.trim();
					if (!v) return;
					context.filters.push({ type: newFilterType, value: v });
					await this.plugin.saveSettings();
					this.display();
				}));
		}
	}
}
