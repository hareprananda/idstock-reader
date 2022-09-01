import typescript from 'rollup-plugin-typescript2'
import ttypescript from 'ttypescript'
import { terser } from 'rollup-plugin-terser'

const options = [
  {
    input: 'src/index.ts',
    cache: false,
    external: ['read-excel-file/node', 'humps'],
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        exports: 'default',
      },
      {
        file: 'dist/index.esm.js',
        format: 'es',
        exports: 'default',
      },
    ],
    plugins: [
      typescript({
        typescript: ttypescript,
        tsconfigOverride: {
          compilerOptions: { module: 'ESNext' },
          include: ['src/index.ts'],
          exclude: [],
        },
      }),
      terser(),
    ],
  },
]

export default options
