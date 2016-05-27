module.exports = function(grunt) {

    grunt.initConfig({
        php: {
            dist: {
                options: {
                    hostname: '127.0.0.1',
                    port: 9000,
                    base: './', // Project root
                    keepalive: false,
                    open: false
                }
            }
        },
        browserSync: {
            dist: {
                bsFiles: {
                    src: [
                        'css/*.css', '*.html', 'js/*.js'
                    ]
                },
                options: {
                    proxy: '<%= php.dist.options.hostname %>:<%= php.dist.options.port %>',
                    watchTask: true,
                    notify: true,
                    open: true,
                    logLevel: 'silent',
                    ghostMode: {
                        clicks: true,
                        scroll: true,
                        links: true,
                        forms: true
                    }
                }
            }
        },
        watch: {
            sass: {
                files: 'sass/**/*.sass',
                tasks: ['sass']
            },
            cssmin: {
                files: 'css/app.css',
                tasks: ['cssmin']
            },
            uglify: {
                files: 'js/app.js',
                tasks: ['uglify']
            }
        },
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'css/app.css': 'sass/app.sass'
                }
            }
        },
        uglify: {
            my_target: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'js/sourcemap.map'
                },
                files: {
                    'js/app.min.js': ['js/app.js']
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'css/',
                    src: ['*.css', '!*.min.css'],
                    dest: 'css/',
                    ext: '.min.css'
                }]
            }
        }
    });
    grunt.loadNpmTasks('grunt-php');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('min', ['uglify', 'cssmin'])
    grunt.registerTask('default', [
        'sass',
        'php:dist', // Start PHP Server
        'browserSync:dist', // Using the PHP instance as a proxy
        'watch' // Any other watch tasks you want to run
    ]);

};
