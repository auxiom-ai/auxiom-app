# Auxiom React Native App Built with Expo

## Get started
1. Install dependencies
   ```bash
   npm install
   ```
2. Start the app
   ```bash
   npx expo start
   ```
## Repository Practices
Continuous Integration is set up to ensure changes do not break the native expo builds. Please make all changes via pull requests.

1. Ensure the repo is cloned locally
2. Open a git bash terminal and navigate to the parent `/` directory (titled auxiom-app).
3. Type `git branch [branch name]`. You have created a new local branch. Name your branch after the feature you're creating.
4. Type `git checkout [branch name]`. You should now be on that branch.
5. Make your changes
6. Type `git push --set-upstream origin [branch name]`. You have now created a branch on the origin (remote) with the same name as your local branch.
7. Type `git add [file name]` to stage the changes from your specifed file. Type `git add .` to stage all changes.
8. Type `git commit -m [message]` with an informative message.
9. Type `git push` to push your changes to the remote instance of your branch.
10. The change has now created a pull request. Wait for the github actions to finish. If they pass, merge your branch into main.
11. Switch back to the main branch on your local machine with `git checkout main`.
12. Run `git pull` to pull the changes from the remote branch. Do this frequently to stay up to date with everyone's changes.
13. Repeat the process for each new feature.

### NOTE: If your change is small, you may merge your pull request without waiting for the action to finish.
Please shut down the action by clicking on the small yellow dot in line with your commit message. This conserves resources in our free plan.