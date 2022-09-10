import fs from 'fs'
import path from 'path'

const origin = fs.readFileSync(path.resolve('package.json')).toString('utf-8')
const stringified = JSON.parse(origin)
delete stringified.devDependencies
delete stringified.scripts
delete stringified['lint-staged']
fs.writeFileSync(path.resolve('package.json'), Buffer.from(JSON.stringify(stringified, null, 2), 'utf-8'))
