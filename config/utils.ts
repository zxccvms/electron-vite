import cliColor from "cli-color"
import path from "path"

export const root = path.join(__dirname, "..")
export const getPath = (relativePath: string) => path.join(root, relativePath)

export const printToTerminal = (
  type: "main" | "renderer",
  content: string,
  color: "white" | "yellow" | "red" = "white"
) => {
  if (!content) return
  const prefix = cliColor[type === "main" ? "blue" : "green"](`[${type}]`)
  const outContent = cliColor[color](content)
  console.log(prefix + outContent)
}
