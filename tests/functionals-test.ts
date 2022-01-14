import chai from "chai";
import chaiHttp from "chai-http";
import server from "../src/server";
// import { suite, test } from "mocha";
import { assert } from "chai";
chai.use(chaiHttp);

suite("API test", function () {
    test("Success request to query/lolcats?page=2", function (done) {
        chai.request(server)
            .get("/query/lolcats")
            .query({
                page: 2,
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, "images");
                assert.isArray(res.body.images);
                assert.hasAllKeys(res.body.images[0], [
                    "type",
                    "width",
                    "height",
                    "size",
                    "url",
                    "thumbnail",
                    "description",
                    "parentPage",
                ]);
                assert.hasAllDeepKeys(res.body.images[0].thumbnail, [
                    "url",
                    "width",
                    "height",
                ]);
                done();
            });
    });
});
