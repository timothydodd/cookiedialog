---
title: WordPress Integration
description: How to integrate CookieDialog with WordPress websites
---

# WordPress Integration

CookieDialog can be easily integrated into WordPress sites through various methods.

## Method 1: Plugin Files

Add CookieDialog files to your active theme:

### 1. Download and Upload Files

Download the CookieDialog files and upload them to your theme directory:
```
/wp-content/themes/your-theme/assets/cookiedialog/
├── cookiedialog.min.js
└── cookiedialog.min.css
```

### 2. Enqueue in functions.php

```php
// functions.php
function enqueue_cookiedialog() {
    // Enqueue CSS
    wp_enqueue_style(
        'cookiedialog-css',
        get_template_directory_uri() . '/assets/cookiedialog/cookiedialog.min.css',
        array(),
        '1.0.3'
    );
    
    // Enqueue JavaScript
    wp_enqueue_script(
        'cookiedialog-js',
        get_template_directory_uri() . '/assets/cookiedialog/cookiedialog.min.js',
        array(),
        '1.0.3',
        true
    );
    
    // Initialize CookieDialog
    wp_add_inline_script('cookiedialog-js', '
        document.addEventListener("DOMContentLoaded", function() {
            CookieDialog.init({
                position: "bottom",
                theme: "light",
                privacyUrl: "' . get_privacy_policy_url() . '",
                categories: [
                    { id: "necessary", name: "Essential", required: true },
                    { id: "analytics", name: "Analytics", required: false },
                    { id: "marketing", name: "Marketing", required: false }
                ],
                onAccept: function(consent) {
                    if (consent.categories.analytics) {
                        // Enable Google Analytics
                        enableAnalytics();
                    }
                    if (consent.categories.marketing) {
                        // Enable marketing tools
                        enableMarketing();
                    }
                }
            });
        });
        
        function enableAnalytics() {
            if (typeof gtag !== "undefined") {
                gtag("config", "GA_MEASUREMENT_ID");
            }
        }
        
        function enableMarketing() {
            if (typeof fbq !== "undefined") {
                fbq("init", "FACEBOOK_PIXEL_ID");
                fbq("track", "PageView");
            }
        }
    ');
}
add_action('wp_enqueue_scripts', 'enqueue_cookiedialog');
```

## Method 2: CDN Integration

### Using CDN in functions.php

```php
// functions.php
function enqueue_cookiedialog_cdn() {
    // CDN CSS
    wp_enqueue_style(
        'cookiedialog-css',
        'https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.css',
        array(),
        '1.0.3'
    );
    
    // CDN JavaScript
    wp_enqueue_script(
        'cookiedialog-js',
        'https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.js',
        array(),
        '1.0.3',
        true
    );
    
    // Configuration
    $config = array(
        'position' => 'bottom',
        'theme' => get_theme_mod('cookiedialog_theme', 'light'),
        'privacyUrl' => get_privacy_policy_url(),
        'enableLocation' => get_option('cookiedialog_enable_location', false),
        'categories' => array(
            array('id' => 'necessary', 'name' => 'Essential', 'required' => true),
            array('id' => 'analytics', 'name' => 'Analytics', 'required' => false),
            array('id' => 'marketing', 'name' => 'Marketing', 'required' => false)
        )
    );
    
    wp_localize_script('cookiedialog-js', 'CookieDialogConfig', $config);
    
    wp_add_inline_script('cookiedialog-js', '
        document.addEventListener("DOMContentLoaded", function() {
            CookieDialog.init(CookieDialogConfig);
        });
    ');
}
add_action('wp_enqueue_scripts', 'enqueue_cookiedialog_cdn');
```

## Method 3: Custom WordPress Plugin

Create a custom plugin for better organization:

```php
<?php
/*
Plugin Name: CookieDialog Integration
Description: Integrates CookieDialog for GDPR compliance
Version: 1.0
*/

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class CookieDialogWP {
    
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'settings_init'));
        add_shortcode('cookie-settings', array($this, 'cookie_settings_shortcode'));
    }
    
    public function enqueue_scripts() {
        wp_enqueue_style(
            'cookiedialog-css',
            'https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.css'
        );
        
        wp_enqueue_script(
            'cookiedialog-js',
            'https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.js',
            array(),
            '1.0.3',
            true
        );
        
        $options = get_option('cookiedialog_settings');
        $config = array(
            'position' => $options['position'] ?? 'bottom',
            'theme' => $options['theme'] ?? 'light',
            'privacyUrl' => get_privacy_policy_url(),
            'enableLocation' => isset($options['enable_location']),
            'categories' => array(
                array('id' => 'necessary', 'name' => 'Essential', 'required' => true),
                array('id' => 'analytics', 'name' => 'Analytics', 'required' => false),
                array('id' => 'marketing', 'name' => 'Marketing', 'required' => false)
            )
        );
        
        wp_localize_script('cookiedialog-js', 'CookieDialogWP', $config);
        
        wp_add_inline_script('cookiedialog-js', $this->get_init_script());
    }
    
    private function get_init_script() {
        return '
        document.addEventListener("DOMContentLoaded", function() {
            CookieDialog.init({
                ...CookieDialogWP,
                onAccept: function(consent) {
                    // WordPress-specific integrations
                    if (consent.categories.analytics) {
                        enableWordPressAnalytics();
                    }
                    if (consent.categories.marketing) {
                        enableWordPressMarketing();
                    }
                    
                    // Fire WordPress event
                    document.dispatchEvent(new CustomEvent("cookieConsent", {
                        detail: consent
                    }));
                }
            });
        });
        
        function enableWordPressAnalytics() {
            // Google Analytics for WordPress
            if (typeof gtag !== "undefined") {
                gtag("config", "' . get_option('google_analytics_id', '') . '");
            }
            
            // MonsterInsights compatibility
            if (typeof __gaTracker !== "undefined") {
                __gaTracker("send", "pageview");
            }
        }
        
        function enableWordPressMarketing() {
            // Facebook Pixel
            var pixelId = "' . get_option('facebook_pixel_id', '') . '";
            if (pixelId && typeof fbq !== "undefined") {
                fbq("init", pixelId);
                fbq("track", "PageView");
            }
        }
        ';
    }
    
    public function add_admin_menu() {
        add_options_page(
            'CookieDialog Settings',
            'Cookie Dialog',
            'manage_options',
            'cookiedialog',
            array($this, 'settings_page')
        );
    }
    
    public function settings_init() {
        register_setting('cookiedialog', 'cookiedialog_settings');
        
        add_settings_section(
            'cookiedialog_section',
            'CookieDialog Configuration',
            null,
            'cookiedialog'
        );
        
        add_settings_field(
            'position',
            'Dialog Position',
            array($this, 'position_field'),
            'cookiedialog',
            'cookiedialog_section'
        );
        
        add_settings_field(
            'theme',
            'Dialog Theme',
            array($this, 'theme_field'),
            'cookiedialog',
            'cookiedialog_section'
        );
    }
    
    public function position_field() {
        $options = get_option('cookiedialog_settings');
        $position = $options['position'] ?? 'bottom';
        ?>
        <select name="cookiedialog_settings[position]">
            <option value="bottom" <?php selected($position, 'bottom'); ?>>Bottom</option>
            <option value="top" <?php selected($position, 'top'); ?>>Top</option>
            <option value="center" <?php selected($position, 'center'); ?>>Center</option>
        </select>
        <?php
    }
    
    public function theme_field() {
        $options = get_option('cookiedialog_settings');
        $theme = $options['theme'] ?? 'light';
        ?>
        <select name="cookiedialog_settings[theme]">
            <option value="light" <?php selected($theme, 'light'); ?>>Light</option>
            <option value="dark" <?php selected($theme, 'dark'); ?>>Dark</option>
        </select>
        <?php
    }
    
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>CookieDialog Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('cookiedialog');
                do_settings_sections('cookiedialog');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
    
    public function cookie_settings_shortcode($atts) {
        $atts = shortcode_atts(array(
            'text' => 'Cookie Settings',
            'class' => 'cookie-settings-btn'
        ), $atts);
        
        return '<button class="' . esc_attr($atts['class']) . '" onclick="CookieDialog.init().show()">' 
               . esc_html($atts['text']) . '</button>';
    }
}

new CookieDialogWP();
```

## Integration with Popular Plugins

### Google Analytics (MonsterInsights)

```php
// functions.php
function cookiedialog_monsterinsights_integration() {
    ?>
    <script>
    document.addEventListener('cookieConsent', function(event) {
        if (event.detail.categories.analytics) {
            // Enable MonsterInsights tracking
            if (typeof __gaTracker !== 'undefined') {
                __gaTracker('send', 'pageview');
            }
        }
    });
    </script>
    <?php
}
add_action('wp_footer', 'cookiedialog_monsterinsights_integration');
```

### WooCommerce

```php
// functions.php
function cookiedialog_woocommerce_integration() {
    if (!class_exists('WooCommerce')) return;
    
    ?>
    <script>
    document.addEventListener('cookieConsent', function(event) {
        var consent = event.detail;
        
        if (consent.categories.marketing) {
            // Enable WooCommerce marketing features
            if (typeof gtag !== 'undefined') {
                // Enhanced ecommerce tracking
                gtag('config', 'GA_MEASUREMENT_ID', {
                    'custom_map': {'custom_parameter': 'consent_marketing'}
                });
            }
        }
    });
    </script>
    <?php
}
add_action('wp_footer', 'cookiedialog_woocommerce_integration');
```

## Theme Integration

### Adding to header.php

```php
<!-- In your theme's header.php -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.css">
<script src="https://cdn.jsdelivr.net/npm/cookiedialog@1.0.3/dist/cookiedialog.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    CookieDialog.init({
        position: 'bottom',
        privacyUrl: '<?php echo get_privacy_policy_url(); ?>',
        categories: [
            { id: 'necessary', name: 'Essential', required: true },
            { id: 'analytics', name: 'Analytics', required: false }
        ]
    });
});
</script>
```

### Cookie Settings Link

Add a cookie settings link to your menu or footer:

```php
// In your theme template
<a href="#" onclick="CookieDialog.init().show(); return false;">
    Cookie Settings
</a>
```

Or use the shortcode:
```
[cookie-settings text="Manage Cookies" class="btn btn-primary"]
```

## Customizer Integration

```php
// functions.php
function cookiedialog_customizer($wp_customize) {
    $wp_customize->add_section('cookiedialog_section', array(
        'title' => 'Cookie Dialog',
        'priority' => 120
    ));
    
    $wp_customize->add_setting('cookiedialog_theme', array(
        'default' => 'light'
    ));
    
    $wp_customize->add_control('cookiedialog_theme', array(
        'label' => 'Dialog Theme',
        'section' => 'cookiedialog_section',
        'type' => 'select',
        'choices' => array(
            'light' => 'Light',
            'dark' => 'Dark'
        )
    ));
}
add_action('customize_register', 'cookiedialog_customizer');
```