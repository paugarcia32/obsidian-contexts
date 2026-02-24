import { App, IconName, ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import type ContextsPlugin from '../main';
import { filterFiles } from '../context-filter';

export const VIEW_TYPE_CONTEXTS = 'contexts-panel';

interface TreeNode {
	name: string;
	path: string;
	children: TreeNode[];
	file?: TFile;
}

export class ContextsView extends ItemView {
	private plugin: ContextsPlugin;
	navigation = false;

	constructor(leaf: WorkspaceLeaf, plugin: ContextsPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_CONTEXTS;
	}

	getDisplayText(): string {
		return 'Contexts';
	}

	getIcon(): IconName {
		return 'folder-open';
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {}

	render(): void {
		this.contentEl.empty();

		// ── Context switcher ──────────────────────────────────────────
		const header = this.contentEl.createDiv('nav-header');
		const select = header.createEl('select', { cls: 'contexts-switcher dropdown' });
		select.createEl('option', { value: '', text: '— No context —' });
		for (const ctx of this.plugin.settings.contexts) {
			const opt = select.createEl('option', { value: ctx.id, text: ctx.name });
			if (ctx.id === this.plugin.activeContextId) opt.selected = true;
		}
		select.addEventListener('change', () => {
			this.plugin.activeContextId = select.value || null;
			this.render();
		});

		// ── File tree ─────────────────────────────────────────────────
		const treeContainer = this.contentEl.createDiv('nav-files-container');

		const activeCtx = this.plugin.settings.contexts
			.find(c => c.id === this.plugin.activeContextId) ?? null;
		const allFiles = this.app.vault.getMarkdownFiles();
		const visibleFiles = activeCtx
			? filterFiles(activeCtx, allFiles, this.app.metadataCache)
			: allFiles;

		const root = buildTree(visibleFiles);
		renderTree(treeContainer, root, this.app, 0);
	}
}

// ── Tree builder ──────────────────────────────────────────────────────────────

function buildTree(files: TFile[]): TreeNode {
	const root: TreeNode = { name: '', path: '', children: [] };
	for (const file of files) {
		const parts = file.path.split('/');
		let node = root;
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i] ?? '';
			let child: TreeNode | undefined = node.children.find(c => c.name === part && !c.file);
			if (!child) {
				const newNode: TreeNode = { name: part, path: parts.slice(0, i + 1).join('/'), children: [] };
				node.children.push(newNode);
				child = newNode;
			}
			node = child;
		}
		node.children.push({ name: file.basename, path: file.path, children: [], file });
	}
	return root;
}

function sortedChildren(children: TreeNode[]): TreeNode[] {
	return [...children].sort((a, b) => {
		if (!a.file && b.file) return -1;  // folders before files
		if (a.file && !b.file) return 1;
		return a.name.localeCompare(b.name);
	});
}

// ── Tree renderer ─────────────────────────────────────────────────────────────

function renderTree(container: HTMLElement, node: TreeNode, app: App, depth: number): void {
	if (node.file) {
		// File leaf
		const item = container.createDiv({ cls: 'nav-file' });
		item.style.paddingLeft = `${depth * 16}px`;
		item.createDiv({ cls: 'nav-file-title', text: node.file.basename })
			.addEventListener('click', () => {
				app.workspace.getLeaf(false).openFile(node.file!);
			});
	} else if (depth > 0) {
		// Folder node (skip root)
		const folder = container.createDiv({ cls: 'nav-folder' });
		folder.style.paddingLeft = `${depth * 16}px`;
		folder.createDiv({ cls: 'nav-folder-title', text: node.name });
		for (const child of sortedChildren(node.children)) {
			renderTree(container, child, app, depth + 1);
		}
	} else {
		// Root — render children directly at depth 0
		for (const child of sortedChildren(node.children)) {
			renderTree(container, child, app, depth);
		}
	}
}
