Cody Olsen
  Aug 12th at 05:18
Linear.app wants to use our styled-component  fork :thinking_face:  Maybe we should open source them and talk about them (it's quite the story behind how we went from trying to make styled-components  faster and ending up with two forks)
Comment on #4332 feat: use insertion effects when available
<https://github.com/styled-components/styled-components|styled-components/styled-components>styled-components/styled-components | Aug 11th | Added by GitHub
sanity-io/css-in-js
Website
https://css-in-js-benchmarks.sanity.dev/
Language
TypeScript
Added by GitHub







Josh Ellis
:face_with_thermometer:  Aug 12th at 05:22
I think we should but i would maybe make it explicit that this is OSS and we're not actively maintaining it since we're moving to vanilla extract...?


Cody Olsen
  Aug 12th at 05:22
For sure
:100:
1



Josh Ellis
:face_with_thermometer:  Aug 12th at 05:23
but definitely worth it, especially for streaming as well, i think a lot of people would be interested in it...


Cody Olsen
  Aug 12th at 05:26
Seems like it, feels like we have an opportunity to do some good in the OSS world here and as long as we're clear that this is just a gentler offboarding of styled-components , and not meant to breathe new life into the project, then I don't think it'll cost us much to do it.
:agreed:
3



James Warner
  Aug 13th at 04:56
And that's the story of how @cody became the new styled-components maintainer :sweat_smile:
:joy:
5



Josh Ellis
:face_with_thermometer:  Aug 13th at 04:59
it'll make for a great documentary


Cody Olsen
  Aug 14th at 02:25
@knut @even got word back from Linear after testing our @sanity/styled-components  fork on their electron app, performance did improve!
I think we should consider open sourcing this with a bang, and brag about real world apps that are faster for it.
Our angle is that nobody should use styled-components  anymore, but one doesn't simply remove it, and so while your long term plan should be to move to vanilla-extract , tailwindcss , linaria  or whatever else, we offer a short term plan where your brownfield styled-components  are at least as fast as it can be :pray:
:point_up::skin-tone-3:
1



Knut Melvær
  Aug 14th at 07:17
Sounds good to me!
How can I help get the story on paper, if we choose the flip the switch?
Also, I guess we should consider what we put in large type at the top of the readme, so it's clear what to expect from this? (edited) 


Even Westvang
  Aug 14th at 07:27
I'm all for it - would make it contingent on writing about what we've been doing on styled components and perf. Make sure to mark it well that it's not actively maintained!


Cody Olsen
  Aug 14th at 08:50
it'll be actively maintained, but we won't be expanding the scope or include features we don't care about (like react native) :innocent:
I can talk to the linear dev when were on the other side of this thing, and they have it in production, would be super cool if they'd be up for quotes or an interview or whatever


Cody Olsen
  Aug 14th at 08:50
Also, I guess we should consider what we put in large type at the top of the readme, so it's clear what to expect from this? (edited)
Absolutely. Have to be super clear that this library is meant to die and everyone should have a long term plan to completely replace styled-components  in their codebases.


Knut Melvær
  Aug 14th at 08:51
do you have some write ups anywhere (in Slack, PRs, etc) about the lib @cody?


Cody Olsen
  Aug 14th at 08:52
It's spread out here and there. I'm on support rotation this week so I can't go dig it up now but I can brain dump for you next week :heart:


Knut Melvær
  Aug 14th at 08:53
awesome!


Even Westvang
  Aug 14th at 09:05
@eoin should have opinions as well if we're pulling in maint and it's not just PoC grade :)
Also sent to the channel


Cody Olsen
  Aug 14th at 22:52
Linear.app is now 40% faster ya'll with our @sanity/styled-components fork :mind-blown-telegram:
IMG_8174
 
IMG_8174


:heart:
21
:woo:
13
:cat_woah:
9
:sonic-run:
8
:clapping:
4



Even Westvang
  Aug 15th at 09:22
Solid


Knut Melvær
  Aug 15th at 09:27
nice!


Evelina Wahlström
  Tuesday at 07:42
@cody / @knut Did you ever catch-up on this?
I was thinking I could mention it in my upcoming What's New newsletter / blog post that is due to be published on Monday the 1st, if that seems appropriate for this?
Definitely want to make sure I am covering it in the right way though!


Knut Melvær
  Tuesday at 07:44
I think the ideal situation is to do a dedicated blog post on this - @cody should we try to make it happen? I only need your raw and unfiltered thoughts on why we made it, roughly how it works, and what we learned from doing the project - we can meet or you can do one of your slack writeups :smile: (edited) 
:+1::skin-tone-3:
1



Evelina Wahlström
  Tuesday at 07:45
makes sense! If it goes out before Monday, let me know and I can feature it in the newsletter - no worries if not though as I have other things I can write about :blush:
New


Cody Olsen
  4 minutes ago
I’m flexible next week and would love to zoom brain dump with you @knut ! Linear keeps pushing for us to open it up:
Do you have any idea when you plan to make the repo public? I feel like if you do an updated README where you make it clear that Sanity is not the new s-c maintainer, then it should be good to go.
A lot of companies would benefit from the fork.
Kenneth at Linear
I’ve asked if they’re up for giving us some quotes for the blog post and they’re happy to :raised_hands: 