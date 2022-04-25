import { getCommandLineParams } from '../utils'
import { startRenderer } from './utils'

const commandLineParams = getCommandLineParams()

startRenderer(commandLineParams)
