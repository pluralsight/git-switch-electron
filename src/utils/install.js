import fs from 'fs'
import os from 'os'
import path from 'path'

const GIT_SWITCH_PATH = path.join(os.homedir(), '.git-switch')
const CONFIG_FILE = path.join(GIT_SWITCH_PATH, 'config.json')

export default function() {
  if (!fs.existsSync(GIT_SWITCH_PATH)) {
    fs.mkdirSync(GIT_SWITCH_PATH)
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ users: [], repos: [] }))
  }
}
