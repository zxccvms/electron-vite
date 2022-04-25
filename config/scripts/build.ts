import { getCommandLineParams } from '../utils'
import { buildMain, buildRenderer } from './utils'

const commandLineParams = getCommandLineParams()

buildRenderer(commandLineParams)
buildMain(commandLineParams)
