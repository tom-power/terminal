/** @babel */

import { CompositeDisposable } from 'atom'

import { TerminalElement } from './element'
import { TerminalModel } from './model'

import { v4 as uuidv4 } from 'uuid'

const TERMINAL_BASE_URI = 'terminal://'

class Terminal {
	constructor () {
		// Disposables for this plugin.
		this.disposables = new CompositeDisposable()

		// Set holding all terminals available at any moment.
		this.terminalsSet = new Set()

		this.disposables.add(
			// Register view provider for terminal emulator item.
			atom.views.addViewProvider(TerminalModel, (terminalModel) => {
				const terminalElement = new TerminalElement()
				terminalElement.initialize(terminalModel)
				return terminalElement
			}),

			// Add opener for terminal emulator item.
			atom.workspace.addOpener((uri) => {
				if (uri.startsWith(TERMINAL_BASE_URI)) {
					const item = new TerminalModel({
						uri: uri,
						terminalsSet: this.terminalsSet,
					})
					return item
				}
			}),

			// Set callback to run on current and future panes.
			atom.workspace.observePanes((pane) => {
				// In callback, set another callback to run on current and future items.
				this.disposables.add(pane.observeItems((item) => {
					// In callback, set current pane for terminal items.
					if (TerminalModel.isTerminalModel(item)) {
						item.setNewPane(pane)
					}
					TerminalModel.recalculateActive(this.terminalsSet)
				}))
				TerminalModel.recalculateActive(this.terminalsSet)
			}),

			// Add callbacks to run for current and future active items on active panes.
			atom.workspace.observeActivePaneItem((item) => {
				// In callback, focus specifically on terminal when item is terminal item.
				if (TerminalModel.isTerminalModel(item)) {
					item.focusOnTerminal()
				}
				TerminalModel.recalculateActive(this.terminalsSet)
			}),

			atom.workspace.getRightDock().observeVisible((visible) => {
				if (visible) {
					const item = atom.workspace.getRightDock().getActivePaneItem()
					if (TerminalModel.isTerminalModel(item)) {
						item.focusOnTerminal()
					}
				}
				TerminalModel.recalculateActive(this.terminalsSet)
			}),

			atom.workspace.getLeftDock().observeVisible((visible) => {
				if (visible) {
					const item = atom.workspace.getLeftDock().getActivePaneItem()
					if (TerminalModel.isTerminalModel(item)) {
						item.focusOnTerminal()
					}
				}
				TerminalModel.recalculateActive(this.terminalsSet)
			}),

			atom.workspace.getBottomDock().observeVisible((visible) => {
				if (visible) {
					const item = atom.workspace.getBottomDock().getActivePaneItem()
					if (TerminalModel.isTerminalModel(item)) {
						item.focusOnTerminal()
					}
				}
				TerminalModel.recalculateActive(this.terminalsSet)
			}),

			// Add commands.
			atom.commands.add('atom-workspace', {
				'terminal:open': () => this.open(
					this.generateNewUri(),
					this.addDefaultPosition(),
				),
				'terminal:open-center': () => this.openInCenterOrDock(atom.workspace),
				'terminal:open-up': () => this.open(
					this.generateNewUri(),
					{ split: 'up' },
				),
				'terminal:open-down': () => this.open(
					this.generateNewUri(),
					{ split: 'down' },
				),
				'terminal:open-left': () => this.open(
					this.generateNewUri(),
					{ split: 'left' },
				),
				'terminal:open-right': () => this.open(
					this.generateNewUri(),
					{ split: 'right' },
				),
				'terminal:open-bottom-dock': () => this.openInCenterOrDock(atom.workspace.getBottomDock()),
				'terminal:open-left-dock': () => this.openInCenterOrDock(atom.workspace.getLeftDock()),
				'terminal:open-right-dock': () => this.openInCenterOrDock(atom.workspace.getRightDock()),
				'terminal:close-all': () => this.exitAllTerminals(),
			}),
			atom.commands.add('atom-terminal', {
				'terminal:close': () => this.close(),
				'terminal:restart': () => this.restart(),
				'terminal:copy': () => this.copy(),
				'terminal:paste': () => this.paste(),
				'terminal:unfocus': () => this.unfocus(),
			}),
		)
	}

	activate (state) {}

	destroy () {
		this.exitAllTerminals()
		this.disposables.dispose()
	}

	deserializeTerminalModel (serializedModel) {
		if (atom.config.get('terminal.allowRelaunchingTerminalsOnStartup')) {
			return new TerminalModel({
				uri: serializedModel.uri,
				terminalsSet: this.terminalsSet,
			})
		}
	}

	openInCenterOrDock (centerOrDock, options = {}) {
		const pane = centerOrDock.getActivePane()
		if (pane) {
			options.pane = pane
		}
		return this.open(
			this.generateNewUri(),
			options,
		)
	}

	exitAllTerminals () {
		for (const terminal of this.terminalsSet) {
			terminal.exit()
		}
	}

	getActiveTerminal () {
		const terminals = [...this.terminalsSet]
		return terminals.find(t => t.isActiveTerminal())
	}

	async open (uri, options = {}) {
		return atom.workspace.open(uri, options)
	}

	generateNewUri () {
		return TERMINAL_BASE_URI + uuidv4() + '/'
	}

	/**
	 * Service function which is a wrapper around 'atom.workspace.open()'.
	 *
	 * @async
	 * @function
	 * @param {Object} options Options to pass to call to 'atom.workspace.open()'.
	 * @return {TerminalModel} Instance of TerminalModel.
	 */
	async openTerminal (options = {}) {
		options = this.addDefaultPosition(options)
		return this.open(
			this.generateNewUri(),
			options,
		)
	}

	/**
	 * Service function which opens a terminal and runs the commands.
	 *
	 * @async
	 * @function
	 * @param {string[]} commands Commands to run in the terminal.
	 * @return {TerminalModel} Instance of TerminalModel.
	 */
	async runCommands (commands) {
		let terminal
		if (atom.config.get('terminal.runInActive')) {
			terminal = this.getActiveTerminal()
		}

		if (!terminal) {
			const options = this.addDefaultPosition()
			terminal = await this.open(
				this.generateNewUri(),
				options,
			)
		}

		await terminal.element.initializedPromise
		for (const command of commands) {
			terminal.runCommand(command)
		}
	}

	addDefaultPosition (options = {}) {
		const position = atom.config.get('terminal.defaultOpenPosition')
		switch (position) {
			case 'Center': {
				const pane = atom.workspace.getActivePane()
				if (pane && !('pane' in options)) {
					options.pane = pane
				}
				break
			}
			case 'Split Up':
				if (!('split' in options)) {
					options.split = 'up'
				}
				break
			case 'Split Down':
				if (!('split' in options)) {
					options.split = 'down'
				}
				break
			case 'Split Left':
				if (!('split' in options)) {
					options.split = 'left'
				}
				break
			case 'Split Right':
				if (!('split' in options)) {
					options.split = 'right'
				}
				break
			case 'Bottom Dock': {
				const pane = atom.workspace.getBottomDock().getActivePane()
				if (pane && !('pane' in options)) {
					options.pane = pane
				}
				break
			}
			case 'Left Dock': {
				const pane = atom.workspace.getLeftDock().getActivePane()
				if (pane && !('pane' in options)) {
					options.pane = pane
				}
				break
			}
			case 'Right Dock': {
				const pane = atom.workspace.getRightDock().getActivePane()
				if (pane && !('pane' in options)) {
					options.pane = pane
				}
				break
			}
		}
		return options
	}

	/**
	 * Function providing service functions offered by 'terminal' service.
	 *
	 * @function
	 * @returns {Object} Object holding service functions.
	 */
	provideTerminalService () {
		// TODO: provide other service functions
		return providePlatformIOIDEService()
	}

	/**
	 * Function providing service functions offered by 'platformioIDETerminal' service.
	 *
	 * @function
	 * @returns {Object} Object holding service functions.
	 */
	providePlatformIOIDEService () {
		return {
			updateProcessEnv (vars) {
				for (const name in vars) {
					process.env[name] = vars[name]
				}
			},
			run: (commands) => {
				return this.runCommands(commands)
			},
			getTerminalViews: () => {
				return this.terminalsSet
			},
			open: () => {
				return this.openTerminal()
			},
		}
	}

	close () {
		const terminal = this.getActiveTerminal()
		if (terminal) {
			terminal.exit()
		}
	}

	restart () {
		const terminal = this.getActiveTerminal()
		if (terminal) {
			terminal.restartPtyProcess()
		}
	}

	copy () {
		const terminal = this.getActiveTerminal()
		if (terminal) {
			atom.clipboard.write(terminal.copyFromTerminal())
		}
	}

	paste () {
		const terminal = this.getActiveTerminal()
		if (terminal) {
			terminal.pasteToTerminal(atom.clipboard.read())
		}
	}

	unfocus () {
		atom.views.getView(atom.workspace).focus()
	}
}

let terminal

export { config } from './config'

export function getInstance () {
	if (!terminal) {
		terminal = new Terminal()
	}
	return terminal
}

export function activate (state) {
	return getInstance().activate(state)
}

export function deactivate () {
	if (terminal) {
		terminal.destroy()
		terminal = null
	}
}

export function deserializeTerminalModel (serializedModel) {
	return getInstance().deserializeTerminalModel(serializedModel)
}

export function provideTerminalService () {
	return getInstance().provideTerminalService()
}

export function providePlatformIOIDEService () {
	return getInstance().providePlatformIOIDEService()
}
