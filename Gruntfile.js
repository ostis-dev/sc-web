module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        concat: {
            webcore: {
                src: ['<%=pkg.webCoreDirPath%>' + 'Utils/sc_keynodes.js',
                      '<%=pkg.webCoreDirPath%>' + 'Utils/utils.js',
                      '<%=pkg.webCoreDirPath%>' + 'Utils/sc_helper.js',
                      '<%=pkg.webCoreDirPath%>' + 'Utils/stringview.js',
                      '<%=pkg.webCoreDirPath%>' + 'Utils/cache.js',
                      '<%=pkg.webCoreDirPath%>' + 'Utils/sctp.js',
                      '<%=pkg.webCoreDirPath%>' + 'Utils/fqueue.js',
                      '<%=pkg.webCoreDirPath%>' + 'Utils/binary.js',
                      '<%=pkg.webCoreDirPath%>' + 'Utils/triples.js',
                      '<%=pkg.webCoreDirPath%>' + 'Core/namespace.js',
                      '<%=pkg.webCoreDirPath%>' + 'Core/debug.js',
                      '<%=pkg.webCoreDirPath%>' + 'Core/main.js',
                      '<%=pkg.webCoreDirPath%>' + 'Core/server.js',
                      '<%=pkg.webCoreDirPath%>' + 'Core/arguments.js',
                      '<%=pkg.webCoreDirPath%>' + 'Core/componentsandbox.js',
                      '<%=pkg.webCoreDirPath%>' + 'Core/translation.js',
                      '<%=pkg.webCoreDirPath%>' + 'Core/componentmanger.js',
                      '<%=pkg.webCoreDirPath%>' + 'Core/eventmanager.js',
                      '<%=pkg.webCoreDirPath%>' + 'Ui/namespace.js',
                      '<%=pkg.webCoreDirPath%>' + 'Ui/menu.js',
                      '<%=pkg.webCoreDirPath%>' + 'Ui/langpanel.js',
                      '<%=pkg.webCoreDirPath%>' + 'Ui/locker.js',
                      '<%=pkg.webCoreDirPath%>' + 'Ui/core.js',
                      '<%=pkg.webCoreDirPath%>' + 'Ui/searchpanel.js',
                      '<%=pkg.webCoreDirPath%>' + 'Ui/taskpanel.js',
                      '<%=pkg.webCoreDirPath%>' + 'Ui/argumentspanel.js',
                      '<%=pkg.webCoreDirPath%>' + 'Ui/windowmanager.js',
                      '<%=pkg.webCoreDirPath%>' + 'Ui/userpanel.js'
                ],
                dest: '<%=pkg.clientJsDirPath%>' + 'sc-web-core.js',
            },
            github: {
                src: ['<%=pkg.githubDirPath%>' + 'src/github.js',
                      '<%=pkg.githubDirPath%>' + 'src/github-component.js'],
                dest: '<%=pkg.githubDirPath%>' + 'static/components/js/github/github.js'
            },
            html: {
                src: ['<%=pkg.htmlDirPath%>' + 'src/html.js',
                      '<%=pkg.htmlDirPath%>' + 'src/html-component.js'],
                dest: '<%=pkg.htmlDirPath%>' + 'static/components/js/html/html.js'
            },
            scg: {
                src: ['<%=pkg.scgDirPath%>'+"src/gwf-file-loader.js",
                      '<%=pkg.scgDirPath%>'+"src/gwf-model-objects.js",
                      '<%=pkg.scgDirPath%>'+"src/gwf-object-info-reader.js",
                      '<%=pkg.scgDirPath%>'+"src/scg.js",
                      '<%=pkg.scgDirPath%>'+"src/scg-alphabet.js",
                      '<%=pkg.scgDirPath%>'+"src/scg-debug.js",
                      '<%=pkg.scgDirPath%>'+"src/scg-layout.js",
                      '<%=pkg.scgDirPath%>'+"src/scg-math.js",
                      '<%=pkg.scgDirPath%>'+"src/scg-model-objects.js",
                      '<%=pkg.scgDirPath%>'+"src/scg-object-builder.js",
                      '<%=pkg.scgDirPath%>'+"src/scg-render.js",
                      '<%=pkg.scgDirPath%>'+"src/scg-scene.js",
                      '<%=pkg.scgDirPath%>'+"src/scg-tree.js",
                      '<%=pkg.scgDirPath%>'+"src/scg-component.js"],
                dest: '<%=pkg.scgDirPath%>' + 'static/components/js/scg/scg.js'
            },
            scs: {
                src: ['<%=pkg.scsDirPath%>' + 'src/scs.js',
                      '<%=pkg.scsDirPath%>' + 'src/scs-viewer.js',
                      '<%=pkg.scsDirPath%>' + 'src/scs-output.js',
                      '<%=pkg.scsDirPath%>' + 'src/scn-output.js',
                      '<%=pkg.scsDirPath%>' + 'src/scn-tree.js',
                      '<%=pkg.scsDirPath%>' + 'src/scn-highlighter.js',
                      '<%=pkg.scsDirPath%>' + 'src/scs-component.js'],
                dest: '<%=pkg.scsDirPath%>' + 'static/components/js/scs/scs.js'
            },
        },
        copy: {
            githubJs: {
                cwd: '<%=pkg.githubDirPath%>' + 'static/components/js/github/',
                src: 'github.js',
                dest: '<%=pkg.clientJsDirPath%>' + 'github/',
                expand: true,
                flatten: true
            },
            htmlJs: {
                cwd: '<%=pkg.htmlDirPath%>' + 'static/components/js/html/',
                src: 'html.js',
                dest: '<%=pkg.clientJsDirPath%>' + 'html/',
                expand: true,
                flatten: true
            },
            scgJs: {
                cwd: '<%=pkg.scgDirPath%>' + 'static/components/js/scg/',
                src: 'scg.js',
                dest: '<%=pkg.clientJsDirPath%>' + 'scg/',
                expand: true,
                flatten: true
            },
            scsJs: {
                cwd: '<%=pkg.scsDirPath%>' + 'static/components/js/scs/',
                src: 'scs.js',
                dest: '<%=pkg.clientJsDirPath%>' + 'scs/',
                expand: true,
                flatten: true
            },
            githubCss: {
                cwd: '<%=pkg.githubDirPath%>' + 'static/components/css/',
                src: 'github.css',
                dest: '<%=pkg.clientCssDirPath%>',
                expand: true,
                flatten: true
            },
            htmlCss: {
                cwd: '<%=pkg.htmlDirPath%>' + 'static/components/css/',
                src: 'html.css',
                dest: '<%=pkg.clientCssDirPath%>',
                expand: true,
                flatten: true
            },
            scgCss: {
                cwd: '<%=pkg.scgDirPath%>' + 'static/components/css/',
                src: 'scg.css',
                dest: '<%=pkg.clientCssDirPath%>',
                expand: true,
                flatten: true
            },
            scsCss: {
                cwd: '<%=pkg.scsDirPath%>' + 'static/components/css/',
                src: 'scs.css',
                dest: '<%=pkg.clientCssDirPath%>',
                expand: true,
                flatten: true
            },
            scgHtml: {
                cwd: '<%=pkg.scgDirPath%>' + 'static/components/scg/html/',
                src: ['**/*.html'],
                dest: '<%=pkg.htmlDirPath%>',
                expand: true,
                flatten: true
            },
            htmlImg: {
                cwd: '<%=pkg.htmlDirPath%>' + 'static/components/images/html/',
                src: '**/*.png',
                dest: '<%=pkg.clientImgDirPath%>' + 'html/',
                expand: true,
                flatten: true
            },
            scgImg: {
                cwd: '<%=pkg.scgDirPath%>' + 'static/components/images/scg/',
                src: '*.png',
                dest: '<%=pkg.clientImgDirPath%>' + 'scg/',
                expand: true,
                flatten: true
            },
            scgImgAlphabet: {
                cwd: '<%=pkg.scgDirPath%>' + 'static/components/images/scg/alphabet/',
                src: '*.png',
                dest: '<%=pkg.clientImgDirPath%>' + 'scg/alphabet',
                expand: true,
                flatten: true
            }
        },
        cssmin: {
            githubCss: {
                src: '<%=pkg.clientCssDirPath%>' + "github.css",
                dest: '<%=pkg.clientCssDirPath%>' + "github.min.css"
            },
            htmlCss: {
                src: '<%=pkg.clientCssDirPath%>' + "html.css",
                dest: '<%=pkg.clientCssDirPath%>' + "html.min.css"
            },
            scgCss: {
                src: '<%=pkg.clientCssDirPath%>' + "scg.css",
                dest: '<%=pkg.clientCssDirPath%>' + "scg.min.css"
            },
            scsCss: {
                src: '<%=pkg.clientCssDirPath%>' + "scs.css",
                dest: '<%=pkg.clientCssDirPath%>' + "scs.min.css"
            }
        },
        uglify: {
            githubJs: {
                src: '<%=pkg.clientJsDirPath%>' + "github/github.js",
                dest: '<%=pkg.clientJsDirPath%>' + "github/github.min.js"
            },
            htmlJs: {
                src: '<%=pkg.clientJsDirPath%>' + "html/html.js",
                dest: '<%=pkg.clientJsDirPath%>' + "html/html.min.js"
            },
            scgJs: {
                src: '<%=pkg.clientJsDirPath%>' + "scg/scg.js",
                dest: '<%=pkg.clientJsDirPath%>' + "scg/scg.min.js"
            },
            scsJs: {
                src: '<%=pkg.clientJsDirPath%>' + "scs/scs.js",
                dest: '<%=pkg.clientJsDirPath%>' + "scs/scs.min.js"
            },
            webcore: {
                src: '<%=pkg.clientJsDirPath%>' + "sc-web-core.js",
                dest: '<%=pkg.clientJsDirPath%>' + "sc-web-core.min.js"
            }
        },
        watch: {
            githubJs: {
                files: '<%=pkg.githubDirPath%>' + 'src/*.js',
                tasks: ['newer:concat:github', 'newer:copy:githubJs','newer:uglify:githubJs'],
            },
            htmlJs: {
                files: '<%=pkg.htmlDirPath%>' + 'src/*.js',
                tasks: ['newer:concat:html', 'newer:copy:htmlJs','newer:uglify:htmlJs'],
            },
            scgJs: {
                files: '<%=pkg.scgDirPath%>' + 'src/*.js',
                tasks: ['newer:concat:scg', 'newer:copy:scgJs','newer:uglify:scgJs'],
            },
            scsJs: {
                files: '<%=pkg.scsDirPath%>' + 'src/*.js',
                tasks: ['newer:concat:scs', 'newer:copy:scsJs','newer:uglify:scsJs'],
            },
            githubCss: {
                files: '<%=pkg.githubDirPath%>' + 'static/components/css/*.css',
                tasks: ['newer:copy:githubCss','newer:cssmin:githubCss'],
            },
            htmlCss: {
                files: '<%=pkg.htmlDirPath%>' + 'static/components/css/*.css',
                tasks: ['newer:copy:htmlCss','newer:cssmin:htmlCss'],
            },
            scgCss: {
                files: '<%=pkg.scgDirPath%>' + 'static/components/css/*.css',
                tasks: ['newer:copy:scgCss','newer:cssmin:scgCss'],
            },
            scsCss: {
                files: '<%=pkg.scsDirPath%>' + 'static/components/css/*.css',
                tasks: ['newer:copy:scsCss','newer:cssmin:scsCss'],
            },
            scgHtml: {
                files: ['<%=pkg.scgDirPath%>' + 'static/components/html/*.html'],
                tasks: ['newer:copy:scgHtml'],
            },
            htmlImg: {
                files: ['<%=pkg.htmlDirPath%>' + 'static/components/images/html/*.png',],
                tasks: ['newer:copy:htmlImg'],
            },
            scgImg: {
                files: ['<%=pkg.scgDirPath%>' + 'static/components/images/scg/**/*.png'],
                tasks: ['newer:copy:scgImg', 'newer:copy:scgImgAlphabet'],
            },
            webcore: {
                files: ['<%=pkg.webCoreDirPath%>' + "**/*.js",
                      "!"+'<%=pkg.webCoreDirPath%>'+"test/*.js"],
                tasks: ['newer:concat:webcore',"newer:uglify:webcore"],
            }
        },
    });

    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'copy', 'cssmin', 'uglify', 'watch']);
    grunt.registerTask('test', ['concat:webcore','uglify:webcore','watch:webcore']);

};