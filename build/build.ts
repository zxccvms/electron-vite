import * as builder from 'electron-builder'
import { printToTerminal } from '../config/utils'

printToTerminal

/** https://www.electron.build/configuration/configuration */
const options: builder.Configuration = {
	asar: false,
	protocols: {
		name: 'Deeplink Example',
		// Don't forget to set `MimeType: "x-scheme-handler/deeplink"` for `linux.desktop` entry!
		schemes: ['deeplink'],
	},

	// "store” | “normal” | "maximum". - For testing builds, use 'store' to reduce build time significantly.
	compression: 'normal',
	// removePackageScripts: true,

	// afterSign: async context => {},
	// artifactBuildStarted: context => {},
	// afterAllArtifactBuild: buildResult => {},
	// beforeBuild: async context => {},
	nodeGypRebuild: false,
	buildDependenciesFromSource: false,

	directories: {
		output: 'release',
		// buildResources: 'installer/resources',
	},
	files: 'dist',
	// extraFiles: [
	// 	{
	// 		from: 'dist/factoryMain.development.js',
	// 		to: 'app/factoryMain.development.js',
	// 	},
	// ],
	// extraResources: [
	// 	{
	// 		from: 'dist/factoryMain.development.js',
	// 		to: './app/main.js',
	// 	},
	// ],

	win: {
		target: 'nsis',
	},
	nsis: {
		deleteAppDataOnUninstall: true,
		// include: 'installer/win/nsis-installer.nsh',
	},
}

// Promise is returned
builder
	.build({
		// targets: builder.Platform.MAC.createTarget(),
		config: options,
	})
	.then(result => {
		printToTerminal('packager', JSON.stringify(result))
	})
	.catch(error => {
		printToTerminal('packager', error.toString(), 'red')
	})
