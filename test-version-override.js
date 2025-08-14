import semver from 'semver';

// 模拟服务端的版本覆盖逻辑
function simulateVersionOverride(existingVersions, currentVersion, newVersion) {
    console.log(`\n=== 测试版本覆盖逻辑 ===`);
    console.log(`当前版本: ${currentVersion}`);
    console.log(`历史版本: [${existingVersions.join(', ')}]`);
    console.log(`新上传版本: ${newVersion}`);

    // 检查版本号格式
    if (semver.valid(newVersion) === null) {
        return { action: 'reject', reason: '版本号格式无效' };
    }

    // 检查是否与当前版本相同
    if (currentVersion && semver.eq(newVersion, currentVersion)) {
        return { action: 'reject', reason: '与当前版本相同，不允许上传' };
    }

    // 检查是否与历史版本相同
    const existingVersion = existingVersions.find((v) => semver.eq(v, newVersion));
    if (existingVersion) {
        return {
            action: 'override',
            reason: `与历史版本 ${existingVersion} 相同，将覆盖该历史版本并刷新更新时间`,
        };
    }

    // 检查是否小于已发布版本中的最小值
    if (existingVersions.length > 0) {
        const minVersion = existingVersions.reduce(
            (min, version) => (semver.lt(version, min) ? version : min),
            existingVersions[0],
        );

        if (semver.lt(newVersion, minVersion)) {
            return { action: 'reject', reason: `小于已发布版本中的最小值 ${minVersion}` };
        }
    }

    return { action: 'create', reason: '创建新的版本历史记录' };
}

// 测试场景1: 与历史版本相同
function testScenario1() {
    console.log('\n=== 测试场景1: 与历史版本相同 ===');

    const existingVersions = ['1.1.0', '1.0.2'];
    const currentVersion = '1.1.0';
    const newVersion = '1.0.2';

    const result = simulateVersionOverride(existingVersions, currentVersion, newVersion);
    console.log(`结果: ${result.action} - ${result.reason}`);
}

// 测试场景2: 与当前版本相同
function testScenario2() {
    console.log('\n=== 测试场景2: 与当前版本相同 ===');

    const existingVersions = ['1.1.0', '1.0.2'];
    const currentVersion = '1.1.0';
    const newVersion = '1.1.0';

    const result = simulateVersionOverride(existingVersions, currentVersion, newVersion);
    console.log(`结果: ${result.action} - ${result.reason}`);
}

// 测试场景3: 新版本
function testScenario3() {
    console.log('\n=== 测试场景3: 新版本 ===');

    const existingVersions = ['1.1.0', '1.0.2'];
    const currentVersion = '1.1.0';
    const newVersion = '1.2.0';

    const result = simulateVersionOverride(existingVersions, currentVersion, newVersion);
    console.log(`结果: ${result.action} - ${result.reason}`);
}

// 测试场景4: 第一个版本
function testScenario4() {
    console.log('\n=== 测试场景4: 第一个版本 ===');

    const existingVersions = [];
    const currentVersion = null;
    const newVersion = '1.0.0';

    const result = simulateVersionOverride(existingVersions, currentVersion, newVersion);
    console.log(`结果: ${result.action} - ${result.reason}`);
}

// 测试场景5: 版本号格式无效
function testScenario5() {
    console.log('\n=== 测试场景5: 版本号格式无效 ===');

    const existingVersions = ['1.1.0', '1.0.2'];
    const currentVersion = '1.1.0';
    const newVersion = '1.0';

    const result = simulateVersionOverride(existingVersions, currentVersion, newVersion);
    console.log(`结果: ${result.action} - ${result.reason}`);
}

// 测试场景6: 版本号小于最小值
function testScenario6() {
    console.log('\n=== 测试场景6: 版本号小于最小值 ===');

    const existingVersions = ['1.1.0', '1.0.2'];
    const currentVersion = '1.1.0';
    const newVersion = '1.0.1';

    const result = simulateVersionOverride(existingVersions, currentVersion, newVersion);
    console.log(`结果: ${result.action} - ${result.reason}`);
}

// 运行所有测试
function runAllTests() {
    testScenario1();
    testScenario2();
    testScenario3();
    testScenario4();
    testScenario5();
    testScenario6();
    console.log('\n=== 测试完成 ===');
}

runAllTests();
