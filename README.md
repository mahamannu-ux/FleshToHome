[[FleshToHome]{}](https://trans-serenity-482815-n7.web.app/)
is a Vibe-Coded version of
[[www.freshtohome.com]](http://www.freshtohome.com). It is a
web App, with a web-frontend ( desktop browser ). Not optimized for
Mobile browser

## Scope

1.  The site provides basic functionality for Customer, Products, Orders
    and Cart Management.

## Out Of Scope

1.  Payment gateway Integration.

2.  SMS or whatsapp Integration.

3.  Inventory/warehouse/fulfillment Management. Admin Dashboard.

4.  Actual Delivery or Delivery side app.

5.  Personalized Recommendations.

6.  Customer Mobile App.

## Goal

To test abilities and weaknesses of AI Coding Tools. For this task, a
chat window ( i.e. gemin/chatgpt web app) was used, which did not have
access to all source files, like their CLI/IDE versions. The entire
source code is small,\~2K.

## Learnings - The Good

1.  Gemini ( mix of 3.0 and 2.5 models ) was surprisingly very good at
    most tasks from gathering requirements, capturing intent and
    suggesting changes, even though it did not have access to the source
    files.

2.  A Lack of initial detailed context setting for the model, through a
    well thought out and broken down requirements and plan ( through a
    PRD and plan doc ) meant a lot of back and forth, but the context
    was not lost even after 100+ chats over days.

3.  Occasionally the model took initiative and suggested fixes/solutions
    anticipating my needs.

4.  It was able to guess fairly accurately what my source files or
    directory structure or environment ( PATH , installed software ) are
    while resolving some gnarly bugs especially during Cloud deployment
    to Google Cloud and Firebase.

5.  The overall functional site with major bug fixes and personal
    customizations was ready in 8-10 hours , though it took another 6-8
    hours for various stuff like Software/IDE setup/Git/Github/Cloud
    Deployment, though most of that can be attributed to Rusty Developer
    (me) with a fresh machine, and no/little experience to tech stack
    used ( React, Javascript, HTML , Python, FASTAPI , SQL ).

## Learnings - The Bad

1.  Was inconsistent in output. For example would give a snippet of a
    file ( or the entire file ) for a suggested fix, and moments later
    would provide another snippet of the same file for another fix, but
    the unchanged parts of the file would be different. Perhaps could be
    attributed to lack of access to source files.

## Next Steps

Rearchitect and refactor entire code, but this time using integrated
Gemini CLI in vscode.
