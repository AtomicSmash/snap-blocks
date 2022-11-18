# Setup

First, make sure you have a way to host databases locally. AS Devs, documentation for this is in our Coda platform.

Then, in your "sites" folder, run the following commands.
This assumes you have WP CLI and nvm installed and working globally.

```sh
# Create and move into a folder for plugin development. You can change plugin-dev to whatever folder name you like.
mkdir plugin-dev
cd plugin-dev

# Download the latest version of WP in the British locale
wp core download --locale=en_GB

# Create a WP Config with our database details
wp config create --dbhost="127.0.0.1" --dbname="plugin-dev" --dbuser="YOUR DATABASE USERNAME" --dbpass="YOUR DATABASE PASSWORD"

# Create the database
wp db create

# Install WP
wp core install --admin_user="YOUR USERNAME" --admin_email="YOUR EMAIL ADDRESS" --locale="en_GB" --url="plugin-dev.test" --title="Plugin dev sandbox" --skip-email

# Clone this repo into the plugins folder
git clone https://github.com/AtomicSmash/snap-blocks.git wp-content/plugins/snap-blocks

# NPM install and first build
cd wp-content/plugins/snap-blocks
nvm use
npm install
npm run build
```

You're up and running!
