<?php
/**
 * Plugin Name:       Snap blocks
 * Description:       This is an example block library created for testing purposes.
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Mikey Binns
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       block-test
 *
 * @package           block-test
 */

define('BLOCKS_DIR', plugin_dir_path( __FILE__ ).'blocks/');

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function block_test_block_test_block_init() {
		register_block_assets_by_block_name();
    $blocksFolders = array_diff(scandir(BLOCKS_DIR), array('..', '.'));
    foreach ($blocksFolders as $block) {
        register_block_type( __DIR__ . '/blocks/' . $block . '/block.json' );
    }
}
add_action( 'init', 'block_test_block_test_block_init' );

if (!function_exists('str_starts_with')) {
	function str_starts_with($haystack, $needle) {
			return (string)$needle !== '' && strncmp($haystack, $needle, strlen($needle)) === 0;
	}
}
if (!function_exists('str_ends_with')) {
	function str_ends_with($haystack, $needle) {
		return $needle !== '' ? substr($haystack, -strlen($needle)) === $needle : true;
	}
}

/**
 * Here we register all our JS and CSS files ready to be enqueued.
 * The block names are then referenced in and enqueued from the block.json files of the block.
 */
function register_block_assets_by_block_name() {
	$assets = include( plugin_dir_path( __FILE__ ) . 'assets.php');
	$registeredBlockStyles = array();

	foreach( $assets as $block_path => $asset ) {
		if (!str_starts_with($block_path, 'blocks/')) {
				continue;
		}
		list($block_name, $filename) = explode('/', str_replace('blocks/','',$block_path));
		error_log('$block_path ' . $block_path);
		error_log('$block_name ' . $block_name);
		error_log('$filename ' . $filename);
		list($script_name) = explode('.', $filename);
		if ($script_name === 'index') {
			$script_handle = $block_name . '-script';
		} else if ($script_name === 'editor') {
			$script_handle = $block_name . '-editor-script';
		} else if ($script_name === 'view') {
			$script_handle = $block_name . '-view-script';
		} else {
			$script_handle = $script_name;
		}
		wp_register_script($script_handle, plugins_url( $block_path, __FILE__), $asset['dependencies'], $asset['version'], false);
		if (!in_array($block_name, $registeredBlockStyles, true)) {

			$directoryFiles = array_diff(scandir(BLOCKS_DIR . $block_name), array('..', '.', $filename));
			foreach ($directoryFiles as $file) {
				if (!str_ends_with($file, '.css')) {
					continue;
				}
				$stylesheet_name = explode('.',$file)[0];
				if ($stylesheet_name === 'style') {
					$stylesheet_handle = $block_name . '-styles';
				} else if ($stylesheet_name === 'editor-styles') {
					$stylesheet_handle = $block_name . '-editor-styles';
				} else {
					$stylesheet_handle = $stylesheet_name;
				}
				wp_register_style($stylesheet_handle, plugins_url( $block_name . '/' . $file, __FILE__), array(), null, false);
			}
			$registeredBlockStyles[] = $block_name;
		}
	}
}
