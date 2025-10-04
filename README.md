# About 

Connecting students through shared meals. Our app allows you to create and join food meetups with ease.

# Setup ⚙️
**Note: make sure that both your phone and laptop are on the same wifi network.**

0. Clone this repository locally by typing: `git clone https://github.com/eat-together-team/eat-together.git`.
1. Install [node.js](https://nodejs.org/en/). To ensure that you properly downloaded it, type `npm -v` in the terminal. This will display the currently installed version, if any.
2. Get the Expo mobile app (https://expo.dev/client).
3. Install the Expo npm library:

```jsx
npm install --global expo-cli
```

3. In the home/main directory of this repo, install all required libraries/dependencies:

```jsx
npm install
```

For MacOS users who are unable to use npm, use yarn instead:

```sh
npm install --global yarn
yarn install
```

4. To link this project with Firebase, download the `.env` file from our Google Drive. Simply put it in the root directory. Download links are below!

Core team link: [https://drive.google.com/file/d/1rv-9lrnczpkuq2ZjpwXydzQVsgvxNBbQ/view?usp=drive_link](https://drive.google.com/file/d/1rv-9lrnczpkuq2ZjpwXydzQVsgvxNBbQ/view?usp=drive_link)

Cohort members link: [https://drive.google.com/file/d/1EryzSbUqeC-95YNhzT7ZIMjvOL-uMjb-/view?usp=sharing](https://drive.google.com/file/d/1EryzSbUqeC-95YNhzT7ZIMjvOL-uMjb-/view?usp=sharing)

Ensure that the file is named "**.env**", not "env" (i.e. don't forget the starting period)!

5. Start the environment using expo:

```sh
npx expo start
```

For yarn users, use:

```sh
yarn start
```

6. Once you see a QR code generated, type `s` in the terminal to switch from "development build" to "Expo Go".
7. Scan the generated QR code with the Expo Go app (Android) or your camera app (iOS).
8. Follow any necessary instructions that come (e.g. you may need to create your own EAS/Expo account), until you see an Eat Together-themed loading page!

# Contributing Guidelines 🖥️

We don't have any strict guidelines for your development conventions, but here are some general rules to follow:

1. **Always work in a separate Git branch!** Never push to `master` directly. Instead, create a new branch and push to that. Then, create a pull request to merge your branch with `master`, and add some helpful comments to describe the changes you made. Once that's done, request Eric or Navneeth to review your pull request!
2. **Use our components!** We have a lot of self-made components (e.g. buttons, text, etc.) that you can use in the `components` folder. If you want to make your own component that you think might benefit others in the future, propose your idea to Eric or Navneeth!
3. **For frontend changes, follow the design guidelines outlined in our design library and your prototypes.** For instance, use the exact color hex codes for our green (#5DB075) and red (#EA3323), and use the exact numbers for sizes, margins, paddings, etc. (unless it looks awkward on your end; in that case, discuss with your project lead).
4. **If you spot a bug in the app, report it to Eric or Navneeth.** We'll report it by the next meeting and try to fix it as soon as possible!
5. **Follow the clean code guidelines covered in your CSE classes.** We're not nitpicky about code quality but we do want to be able to understand what it does, especially if we read it months later. If we notice code quality issues in your pull request, we will provide comments asking you to fix them; once you've fixed them, just push a commit to your branch and the changes will automatically appear on the PR.
6. **If you have any questions, ask another member of the Eat Together development team!** We're here to help you out and make sure you have a good experience developing with Eat Together. If you're stuck on something, don't hesitate to reach out, and we'll try our best to respond!

# Navigating the Repository 📂

The majority of development will be happening in the `src` folder. Inside the `src` folder, there are other subfolders:

1. `components`: contains files for our app's self-made components (e.g. buttons, icons, text containers, etc.). Make sure you use them as much as possible! And feel free to create your own :)
2. `navigation`: contains files related to how you navigate around the app as well as authenticating users.
3. `provider`: contains Firebase-related files.
4. `screens`: all of the app's pages are located here! Most of your work will be done here. Any questions about this subdirectory can be directed to Eric or Carl!
5. `tests`: all components' and functions' unit tests will be in here.

There are also some miscellaneous JS scripts (e.g. `allTags.js`) in `src`:

1. `allTags.js` + `eventTags.js` + `foodTags.js` + `schoolTags.js` + `hobbyTags.js`: lists of all the user/event tags in the system.
2. `getDate.js` + `getTime.js`: returns strings of the date and time, respectively, of JS Date objects.
3. `methods.js`: various miscellaneous methods for the app. Make sure to check it out!
4. `profaneWords.js`: a list of profane words (used for filtering user inputs in the app) 😳
5. `timeSlots.js`: contains a list of time slots (used for scheduling in the app).

Other (less but kinda) important files/folders to know:

1. `assets`: contains static images for the app (e.g. logo, stock images).
2. `node_modules`: contains all downloaded libraries for the app (including default React Native stuff). DON'T TOUCH!
3. `.gitignore`: contains a list of files to ignore when pushing to git.
4. `package.json` + `yarn.lock`: contains information about libraries/dependencies the app needs to run (`npm install` and `yarn.lock` rely on this file).

## How React Navigation Auth Flow Works

The checking logged users process is inside `./src/provider/AuthProvider`.

Inside the navigator `./src/navigation/AppNavigator.js`
There are 2 stack navigators:

- `<Auth/>` → for not logged in users stack
- `<Main/>` → for logged in users stack
- `<Loading/>` → when checking if the user is logged in or not loading screen

```jsx
export default () => {
	const auth = useContext(AuthContext);
	const user = auth.user;
	return (
		<NavigationContainer>
			{user == null && <Loading />}
			{user == false && <Auth />}
			{user == true && <Main />}
		</NavigationContainer>
	);
};
```

# Testing (work in progress, ignore for now)

Before you commit your code, you can run all tests / submit new test cases for files you have worked on. To run all tests, use the following command:
```sh
npm tests
```

# Common Bugs & Fixes 🐛

While there are many bugs that can arise while setting up the project, here are a few of the most common ones. Note that this list is not comprehensive nor final.

- Mac users: if `npm install` does not work and displays a long series of errors, it is often because of your computer's security permissions. Try `sudo npm install`, which will prompt you for your password. This will run the install as admin, which should work.
- Mac users: if attempting to launch via simulator and you get the error `Error: xcrun exited with non-zero code: 2
   An error was encountered processing the command (domain=NSPOSIXErrorDomain, code=2):
   Unable to boot device because we cannot determine the runtime bundle.
   No such file or directory`, run the following command in Terminal:

```sh
open -a simulator
```
- Mac users: if `npx expo start` does not work and displays the following error ` Your macOS system limit does not allow enough watchers for Metro, install Watchman instead. Learn more: https://facebook.github.io/watchman/docs/install
Error: EMFILE: too many open files, watch
    at FSEvent.FSWatcher._handle.onchange (node:internal/fs/watchers:204:21) `, 
 	* Go to [https://brew.sh/](https://brew.sh/) and install homebrew.
  	* Run these commands in your terminal to add Homebrew to your PATH:
  	* `echo >> /Users/insert_user_name/.zprofile echo,'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/insert_user_name/.zprofile,eval "$(/opt/homebrew/bin/brewshellenv)"`
  	* **NOTE: This will be displayed on the terminal you used to install homebrew. You can use those to get the desired path of your mac**
  	* Then run `brew update`.
  	* Install watchman using `brew install watchman`. In case you can't wait for homebrew to update you can directly install the latest build from github using `brew install -- HEAD watchman`.
  	* Once watchman is installed, start the environment as normal. If it does not work, try starting expo using a tunnelled connection using `npx expo start --tunnel` or `yarn start --tunnel`.

Once the simulator boots up, immediately quit the simulator app. Run `npm start` or `yarn start` again from the project directory, and open the simulator. It should then be resolved.
- If you ever get a "giant red screen of death" (you'll know what it looks like when you see it), try running `npx expo start -c` or `yarn start -c` to clear the cache. This will often fix the problem.
- If you get an error saying that a certain library is not installed, try running `npm install` or `yarn install` again. If that doesn't work, try deleting the `node_modules` folder and running `npm install` or `yarn install` again.
- ENSURE THAT THE NETWORK USED BY YOUR LAPTOP AND PHONE IS THE EXACT SAME! Otherwise, the app won't load. If this fails, you can also try the tunnel connection using `npx expo start --tunnel` or `yarn start --tunnel`.]


# End of Documentation

--------
