# LanguageForge Visual Design V2 #

The aim of this visual design interation was to provide a Bootstrap 3 upgrade to key views in LanguageForge.

* The home page
* A general content page
* The lexicon editor view
* The comment edit view
* A general lexicon read-only view

There are five html files in this folder that provide the markup for sample pages in the LanguageForge visual redesign November 2014.

## Things to Change in Passing

There are some elements of the design I'd like to see improved along the way.  The supplied design is clean which is good, but there are a few features that could be improved I think.

#### Writing System Abbreviations

These are too striking.   The writing system abbreviation should be subtle and unassuming.  The data in the property is the thing, the abbreviation is secondary.

I suggest that the background should be a light grey / gradient with darker grey for the abbreviation text.

#### Menu Sub-Menu Indicator

This is currently a centered diamond.  I would prefer to see a more conventional upside down triangle to the right of the menu text.

#### Orange Bullets in the Footer

Ummmm, no.  If there's a secondary color that works great!  If not, white is good.

## Implementation Notes ##

#### HTML

This is a reasonably clean implementation of each view based on Bootstrap 3 markup.  It doesn't necessarily relate directly to the current V1 implementation.  It can't be applied directly but needs to be manually incorporated into each view.

#### CSS / LESS

The css is Bootstrap 3 (as shipped) plus overrides.  Less files have also bee supplied which were used to generate the css.  Using the less files, and Bootstrap 3 less to build our own composite style.css would be a good option.

Note that the home page monitor graphic is implemented entirely wtih css.  Wasn't really required, but is a neat trick.

#### JS

No additional js is used or supplied.  The homepage includes design elements for a carousel but these elements are not actually included in a real carousel.
