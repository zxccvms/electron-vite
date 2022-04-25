import { getCommandLineParams } from '../utils'
import { buildRenderer } from './utils'

const commandLineParams = getCommandLineParams()

buildRenderer(commandLineParams)
