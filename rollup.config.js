import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.js',
  output: {
    file: isProduction ? 'lab/request.min.js' : 'lab/request.js',
    format: 'es',
    name: 'request',
  },
  plugins:[
    babel(),
    (isProduction && uglify({}, minify))
  ]
};