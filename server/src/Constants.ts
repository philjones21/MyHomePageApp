import * as path from "path";

export const Constants = {
    LOG_FILE_DIR: __dirname + path.sep + ".." + path.sep + ".." + path.sep + "AppFiles" + path.sep + "logs",
    IMAGE_REPOSITORY_BASE_DIR: __dirname + path.sep + ".." + path.sep + ".." + path.sep + "AppFiles" + path.sep + "ImageRepository",
    DATABASE_DIR: __dirname +  path.sep + ".." + path.sep + ".." + path.sep + "AppFiles" + path.sep + "database" + path.sep + "nedb",
    CONFIG_PATH: __dirname + path.sep + ".." + path.sep +  ".." + path.sep + "config"  + path.sep + "config.json",

    MAX_PHOTO_FILE_SIZE: 5000000,
    VALID_FILE_TYPES: [".jpg", ".jpeg", ".gif", ".png", ".tiff"],
    VALID_MIME_TYPES: ["image/jpeg", "image/png", "image/gif", "image/tiff"],
    VALID_EMBED_URLS: ["https://www.youtube.com"],

    MIN_USER_NAME_CHARS: 2,
    MAX_USER_NAME_CHARS: 40,

    MAX_LOGIN_ATTEMPS: 8,

    MIN_ALBUM_TITLE_CHARS: 1,
    MAX_ALBUM_TITLE_CHARS: 75,

    MAX_ALBUM_DESC_CHARS: 100,

    MAX_PHOTO_DESC_CHARS: 150,

    MIN_BLOG_TITLE_CHARS: 1,
    MAX_BLOG_TITLE_CHARS: 75,

    MAX_BLOG_ARTICLE_CHARS: 2000,

    Environment: {PRODUCTION: "production", DEVELOPMENT: "development"},

};



