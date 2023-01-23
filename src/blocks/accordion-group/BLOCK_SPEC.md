# Accordion block spec

This is the block spec for the Accordion block. Any updates to the block must make sure they follow the spec defined here.
Adding or removing content from this spec should be considered a BREAKING_CHANGE

1. The accordion must work for all types of users, including but not limited to sighted users, screen-reader users, keyboard users, mouse users, and users on different screen sizes.
2. Accordions must be grouped into an accordion group. They should not be placed individually outside of a group, even if there is only a single accordion.
3. The accordion group is used to specify whether multiple accordions in a single group can be open at once. By default, this option is false, meaning only one accordion can be opened at once within a single group.
4. Multiple accordion groups can be used on the same page, and they can have different "isMultiple" states.
5. Each individual accordion can specify whether it is open on the initial page load. By default, this is false, meaning that the accordion will be closed on first page load.
6. Each individual accordion must have a unique Id that doesn't change per render so they can be individually targetted by CSS or JS if needed.
7. The accordion must be open by default, being subsequently closed by JS when it loads so content is not hidden if there is an issue with the JS.
8. Accordion content must allow as many inner blocks as possible, only disabling blocks which would functionally break the accordion, even if from a design standpoint, they don't make sense.
