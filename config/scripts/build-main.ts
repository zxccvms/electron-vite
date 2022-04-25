import { getCommandLineParams } from '../utils'
import { buildMain } from './utils'

const commandLineParams = getCommandLineParams()

buildMain(commandLineParams)
