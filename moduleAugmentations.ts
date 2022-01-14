import "express-session";
declare module "express-session" {
    interface SessionData {
        recentSearchQuery: string;
    }
}
