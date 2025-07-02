import { connect } from "nats";
import { handleGrant } from "./handlers/grant";
import { handleRevoke } from "./handlers/revoke";
import { handleCheck } from "./handlers/check";
import { handleList } from "./handlers/list";
import { initKV } from "./nats/kv";
import { initDatabase } from "./db/init";
import dotenv from 'dotenv';
dotenv.config();


(async () => {
    await initDatabase();
    const nc = await connect({ servers: process.env.NATS_URL });
    await initKV();

    nc.subscribe("permissions.grant", {
        callback: async (_, msg) => {
            const res = await handleGrant(JSON.parse(msg.data.toString()));
            msg.respond(Buffer.from(JSON.stringify(res)));
        },
    });

    nc.subscribe("permissions.revoke", {
        callback: async (_, msg) => {
            const res = await handleRevoke(JSON.parse(msg.data.toString()));
            msg.respond(Buffer.from(JSON.stringify(res)));
        },
    });

    nc.subscribe("permissions.check", {
        callback: async (_, msg) => {
            const res = await handleCheck(JSON.parse(msg.data.toString()));
            msg.respond(Buffer.from(JSON.stringify(res)));
        },
    });

    nc.subscribe("permissions.list", {
        callback: async (_, msg) => {
            const res = await handleList(JSON.parse(msg.data.toString()));
            msg.respond(Buffer.from(JSON.stringify(res)));
        },
    });
})();
