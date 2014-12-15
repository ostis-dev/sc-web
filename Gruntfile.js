module.exports = function (grunt) {


    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // todo: include later
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true,
                    $: true,
                    console: true
                }
            },
            '<%= pkg.name %>': {
                src: [ 'client/**/*.js' ]
            }
        },

        concat: {
            basic_and_extras: {
                files: {
                    '<%= pkg.TARGET_SC_WEB_CORE_PATH %>': [
                        '<%= pkg.SOURCE_SC_WEB_CORE_PATH %>/Utils/*',
                        '<%= pkg.SOURCE_SC_WEB_CORE_PATH %>/Core/namespace.js',
                        '<%= pkg.SOURCE_SC_WEB_CORE_PATH %>/Core/!(namespace).js',
                        '<%= pkg.SOURCE_SC_WEB_CORE_PATH %>/Ui/namespace.js',
                        '<%= pkg.SOURCE_SC_WEB_CORE_PATH %>/Ui/!(namespace).js'
                    ],
                    '<%= pkg.TARGET_GITHUB_PATH %>': [
                        "<%= pkg.SOURCE_GITHUB_PATH %>/github.js",

                        "<%= pkg.SOURCE_GITHUB_PATH %>/github-component.js"
                    ],
                    '<%= pkg.TARGET_HTML_PATH %>': [
                        "<%= pkg.SOURCE_HTML_PATH %>/html.js",

                        "<%= pkg.SOURCE_HTML_PATH %>/html-component.js"
                    ],
                    '<%= pkg.TARGET_SCG_PATH %>': [
                        "<%= pkg.SOURCE_SCG_PATH %>/gwf-file-loader.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/gwf-model-objects.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/gwf-object-info-reader.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/scg.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/scg-alphabet.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/scg-debug.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/scg-layout.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/scg-math.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/scg-model-objects.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/scg-object-builder.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/scg-render.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/scg-scene.js",
                        "<%= pkg.SOURCE_SCG_PATH %>/scg-tree.js",

                        "<%= pkg.SOURCE_SCG_PATH %>/scg-component.js"
                    ],
                    '<%= pkg.TARGET_SCS_PATH %>': [
                        "<%= pkg.SOURCE_SCS_PATH %>/scs.js",
                        "<%= pkg.SOURCE_SCS_PATH %>/scs-viewer.js",
                        "<%= pkg.SOURCE_SCS_PATH %>/scs-output.js",
                        "<%= pkg.SOURCE_SCS_PATH %>/scs-types.js",
                        "<%= pkg.SOURCE_SCS_PATH %>/scn-output.js",
                        "<%= pkg.SOURCE_SCS_PATH %>/scn-tree.js",
                        "<%= pkg.SOURCE_SCS_PATH %>/scn-highlighter.js",

                        "<%= pkg.SOURCE_SCS_PATH %>/scs-component.js"
                    ]
                }
            }
        },

        uglify: {
            options: {
                stripBanners: true,
                banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },

            build: {
                src: '<%= pkg.TARGET_SC_WEB_CORE_PATH %>',
                dest: '<%= pkg.TARGET_SC_WEB_CORE_MIN_PATH %>'
            }
        },

        // todo: include later
        cssmin: {
            with_banner: {
                options: {
                    banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },

                files: {
                    'client/static/components/css/common.css': [
                        'client/static/components/css/*.css'
                    ]
                }
            }
        }

    });

//    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
//    grunt.loadNpmTasks('grunt-contrib-cssmin');


    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('test', ['']);
};