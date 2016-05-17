module.exports = function (grunt) {


    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        concat: {
          js:  {
            src: ['client/static/components/js/sc-web-core.js','client/static/components/js/**/*.js'],
            dest: 'client/static/components/js/sc-web-core1.js'
          },
          css:{
            src: ['client/static/components/css/*.css'],
            dest: 'client/static/components/css/common1.css'
          }
        },

        cssmin: {
            with_banner: {
                options: {
                    banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },

                files: {
                    'client/static/components/css/common1-min.css': [
                        'client/static/components/css/common1.css'
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
                src: 'client/static/components/js/sc-web-core1.js',
                dest: 'client/static/components/js/sc-web-core1-min.js'
            }
        }

       

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');


    grunt.registerTask('default', ['concat','cssmin','uglify']);
    grunt.registerTask('test', ['']);
};
