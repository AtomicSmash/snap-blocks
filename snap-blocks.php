<?php
/**
 * Plugin Name:       Snap blocks
 * Description:       This is a block library created by Atomic Smash.
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Atomic Smash
 * Author URI:        https://www.atomicsmash.co.uk/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       snap-blocks
 */

define( 'NEW_SNAP_BLOCKS_DIR', plugin_dir_path( __FILE__ ) . 'build/blocks/' );

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function new_snap_blocks_init() {
	try {
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_set_error_handler
		set_error_handler(
			function ( $error_number, $error_string, $error_file, $error_line ) {
				// error was suppressed with the @-operator.
				// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.runtime_configuration_error_reporting,WordPress.PHP.DevelopmentFunctions.prevent_path_disclosure_error_reporting
				if ( 0 === error_reporting() ) {
					return false;
				}
				// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
				throw new ErrorException( $error_string, 0, $error_number, $error_file, $error_line );
			}
		);
		$build_directory = scandir( NEW_SNAP_BLOCKS_DIR );
		restore_error_handler();
	} catch ( Exception $e ) {
		if ( is_admin() ) {
			if ( wp_get_environment_type() === 'development' || wp_get_environment_type() === 'local' ) {
				wp_die( 'Blocks directory missing in snap blocks plugin. You may need to run `npm run build` or `npm run dev`' );
			} else {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( 'Blocks directory missing in snap blocks plugin.' );
				wp_die( 'There was a fatal error with the snap blocks plugin. Please install a previous version and inform the Atomic Smash team.' );
			}
		} else {
			return;
		}
	}
	new_snap_register_block_assets_by_block_name();


	$blocks_folders = array_filter(
		array_diff( $build_directory, array( '..', '.' ) ),
		function ( $file_or_directory ) {
			return is_dir( NEW_SNAP_BLOCKS_DIR . $file_or_directory );
		}
	);
	foreach ( $blocks_folders as $block ) {
		register_block_type( __DIR__ . '/build/blocks/' . $block . '/block.json' );
	}
}
add_action( 'init', 'new_snap_blocks_init' );

if ( ! function_exists( 'str_starts_with' ) ) {
	/**
	 * Polyfill for str_starts_with() function added in PHP 8.0.
	 *
	 * @param string $haystack The string to search in.
	 * @param string $needle The substring to search for in the haystack.
	 * @return bool Returns true if haystack starts with needle, false otherwise.
	 */
	function str_starts_with( string $haystack, string $needle ) {
			return '' !== $needle && strncmp( $haystack, $needle, strlen( $needle ) ) === 0;
	}
}
if ( ! function_exists( 'str_ends_with' ) ) {
	/**
	 * Polyfill for str_ends_with() function added in PHP 8.0.
	 *
	 * @param string $haystack The string to search in.
	 * @param string $needle The substring to search for in the haystack.
	 * @return bool Returns true if haystack ends with needle, false otherwise.
	 */
	function str_ends_with( string $haystack, string $needle ) {
		return '' !== $needle ? substr( $haystack, -strlen( $needle ) ) === $needle : true;
	}
}

/**
 * Here we register all our JS and CSS files ready to be enqueued.
 * The block names are then referenced in and enqueued from the block.json files of the block.
 */
function new_snap_register_block_assets_by_block_name() {
	$assets = include plugin_dir_path( __FILE__ ) . 'build/assets.php';
	$registered_block_styles = array();

	foreach ( $assets as $block_path => $asset ) {
		if ( ! str_starts_with( $block_path, 'blocks/' ) ) {
				continue;
		}
		list($block_name, $filename) = explode( '/', str_replace( 'blocks/', '', $block_path ) );
		list($script_name) = explode( '.', $filename );
		if ( 'index' === $script_name ) {
			$script_handle = $block_name . '-script';
		} elseif ( 'editor' === $script_name ) {
			$script_handle = $block_name . '-editor-script';
		} elseif ( 'view' === $script_name ) {
			$script_handle = $block_name . '-view-script';
		} else {
			$script_handle = $script_name;
		}
		wp_register_script( $script_handle, plugins_url( 'build/' . $block_path, __FILE__ ), $asset['dependencies'], $asset['version'], false );
		if ( ! in_array( $block_name, $registered_block_styles, true ) ) {

			$directory_files = array_diff( scandir( NEW_SNAP_BLOCKS_DIR . $block_name ), array( '..', '.', $filename ) );
			foreach ( $directory_files as $file ) {
				if ( ! str_ends_with( $file, '.css' ) ) {
					continue;
				}
				$stylesheet_name = explode( '.', $file )[0];
				if ( 'style' === $stylesheet_name ) {
					$stylesheet_handle = $block_name . '-styles';
				} elseif ( 'editor-styles' === $stylesheet_name ) {
					$stylesheet_handle = $block_name . '-editor-styles';
				} else {
					$stylesheet_handle = $stylesheet_name;
				}
				// Our file names are cache fingerprinted, so we don't need to add a version the traditional WP way.
				// phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
				wp_register_style( $stylesheet_handle, plugins_url( 'build/blocks/' . $block_name . '/' . $file, __FILE__ ), array(), null, false );
			}
			$registered_block_styles[] = $block_name;
		}
	}
}
