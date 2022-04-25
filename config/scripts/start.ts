import { getCommandLineParams } from '../utils'
import { startMain, startRenderer } from './utils'

const commandLineParams = getCommandLineParams()

startRenderer(commandLineParams).then(() => startMain(commandLineParams))
