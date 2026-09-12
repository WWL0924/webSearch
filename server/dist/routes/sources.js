//初始化时更新source来源
import express from "express";
import officialSources from '../config/officialSources.js';
const router = express.Router();
router.get('/', async (req, res) => {
    res.send(officialSources.map(item => ({ label: item.name, value: item.key })));
});
export default router;
//# sourceMappingURL=sources.js.map