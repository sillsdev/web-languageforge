Design for the comment bubble functions (2 of them):

- openCommentPanel(bubbleLocator) - like bubbleLocator.click() but ensures comment div ends up open and having the panel-visible class in it
- closeCommentPanel(bubbleLocator) - like bubbleLocator.click() but ensures comment div ends up closed and having the panel-visible class in it

openCommentPanel:

- Check comments div.
    - Is it open *and* has the panel-visible class? Do nothing and return, because it's already in the desired state.
    - Is it open but does not have the panel-visible class? Add the panel-visible class, then click the button *twice* because the leftover panel might be from a previous comment button.
    - Is it closed (width of 0)? Click the button (just once). Then verify that the panel-visible class is there, and add it if it's not.

closeCommentPanel:
- Check comments div.
    - Is it open *and* has the panel-visible class? Click the button once.
    - Is it open but does *not* have the panel-visible class? Add the panel-visible class, then click the button.
    - Is it closed (width of 0)? Do nothing and return.


Also, because of how different buttons can open the panel, it's probably best to have the following rule: any code that opens the panel to do some work is responsible for closing the panel again afterwards. (Of course, do any `await expect` work first, then close the panel again.)

Then replace all calls to bubbleLocator.click() with either openCommentPanel(bubbleLocator) or closeCommentPanel(bubbleLocator), depending on what the test is expecting at that point.
