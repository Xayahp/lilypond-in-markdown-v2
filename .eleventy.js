/* eslint-disable max-len */
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-es');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const {lilypondExtension} = require('./lilypondExtension');
const {lilycodeExtension} = require('./lilycodeExtension');
const {lilyaudioExtension} = require('./lilyaudioExtension');

// Setup up typography
const Typography = require('typography');
// lincoln theme clobbers the lilypond svg
// const theme = require('typography-theme-lincoln').default;
const theme = require('typography-theme-funston');
const typography = new Typography(theme);

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginSyntaxHighlight);

  eleventyConfig.addFilter('cssmin', function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.addFilter('jsmin', function(code) {
    const minified = UglifyJS.minify(code);
    if ( minified.error ) {
      console.log('UglifyJS error: ', minified.error);
      return code;
    }
    return minified.code;
  });

  // Inject the typography into the page
  eleventyConfig.addShortcode('typography', () => {
    return `<style type="text/css">${typography.toString()}</style>`;
  });
  eleventyConfig.addShortcode('typographyFonts', () => {
    googleFonts = theme.googleFonts;
    const fonts = [];
    for (const i in googleFonts) {
      if (Object.prototype.hasOwnProperty.call(googleFonts, i)) {
        const name = googleFonts[i].name.replace(/\s/g, '+');
        const tempString = `${name}:${googleFonts[i].styles.join(',')}`;
        fonts.push(tempString);
      }
    }
    return `<link href="https://fonts.googleapis.com/css?family=${fonts.join('|')}" rel="stylesheet">`;
  });

  // custom tags for processing lilypond
  eleventyConfig.addNunjucksTag('lilycode', lilycodeExtension);
  eleventyConfig.addNunjucksTag('lilypond', lilypondExtension);
  eleventyConfig.addNunjucksTag('lilyaudio', lilyaudioExtension);

  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addPassthroughCopy('audio');

  /* Markdown Plugins */
  const markdownIt = require('markdown-it');
  const emoji = require('markdown-it-emoji');
  const sup = require('markdown-it-sup');
  const options = {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    xhtmlOut: true,
  };

  eleventyConfig.setLibrary('md', markdownIt(options)
      .use(emoji)
      .use(sup)
  );

  return {
    templateFormats: [
      'md',
      'njk',
      'html',
    ],

    pathPrefix: '/',

    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
};
