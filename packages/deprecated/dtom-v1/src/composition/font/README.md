### Code Point
A *code point* is the atomic unit of information. *Text* is a sequence of code points. Each code point is a number which is given meaning by the Unicode standard.

### Grapheme 
A *grapheme* is a sequence of one or more code points that are displayed as a single, graphical unit that a reader recognizes as a single element of the writing system. For example, both `a` and `ä` are graphemes, but they may consist of multiple code points (e.g. `ä` may be two code points, one for the base character `a` followed by one for the diaeresis; but there's also an alternative, legacy, single code point representing this grapheme). Some code points are never part of any grapheme (e.g. the zero-width non-joiner, or directional overrides).

### Glyph
A *glyph* is an image, usually stored in a *font* (which is a collection of glyphs), used to represent graphemes or parts thereof. Fonts may compose multiple glyphs into a single representation, for example, if the above `ä` is a single code point, a font may choose to render that as two separate, spatially overlaid glyphs. For OTF, the font's GSUB and GPOS tables contain substitution and positioning information to make this work. A font may contain multiple alternative glyphs for the same grapheme, too.