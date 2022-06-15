import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ASFFResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import _ from 'lodash'
import path from 'path'

export default class Prowler2HDF extends Command {
  static usage = 'convert prowler2hdf -i <prowler-finding-json> -o <hdf-output-folder>'

  static description = 'Translate a Prowler-derived AWS Security Finding Format results from concatenated JSON blobs into a Heimdall Data Format JSON file'

  static examples = ['saf convert prowler2hdf -i prowler-asff.json -o output-folder']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Prowler ASFF JSON file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output folder'}),
  }

  async run() {
    const {flags} = await this.parse(Prowler2HDF)
    // comes as an asff-json file which is basically all the findings concatenated into one file instead of putting it in the proper wrapper data structure
    const input = `{"Findings": [${fs.readFileSync(flags.input, 'utf8').trim().split('\n').join(',')}]}`
    const converter = new Mapper(input)
    const results = converter.toHdf()

    if (Object.keys(results).length > 1) {
      _.forOwn(results, (result, filename) => {
        fs.writeFileSync(
          path.join(flags.output, checkSuffix(filename)),
          JSON.stringify(result),
        )
      })
    } else {
      _.forOwn(results, result => {
        fs.writeFileSync(
          path.join(flags.output),
          JSON.stringify(result),
        )
      })
    }
  }
}

