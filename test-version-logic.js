import semver from 'semver';

// 模拟服务端的版本验证逻辑
function validateVersionNumber(existingVersions, currentVersion, newVersion) {
    // 验证版本号格式
    if (semver.valid(newVersion) === null) {
        return { isValid: false, reason: '版本号格式无效' };
    }

    // 如果是第一个版本，直接通过
    if (existingVersions.length === 0) {
        return { isValid: true, reason: '第一个版本' };
    }

    // 检查新版本是否大于等于已发布版本中的最小值
    const minVersion = existingVersions.reduce(
        (min, version) => (semver.lt(version, min) ? version : min),
        existingVersions[0],
    );

    if (semver.lt(newVersion, minVersion)) {
        return { isValid: false, reason: `小于已发布版本中的最小值 ${minVersion}` };
    }

    // 检查是否与当前版本相同（不允许上传当前版本）
    if (currentVersion && semver.eq(newVersion, currentVersion)) {
        return { isValid: false, reason: `与当前版本相同 ${currentVersion}` };
    }

    return { isValid: true, reason: '版本号有效' };
}

// 测试场景：已有版本 [1.1.0, 1.0.2]，当前版本 1.1.0
function testScenario1() {
    console.log('=== 测试场景1: 已有版本 [1.1.0, 1.0.2]，当前版本 1.1.0 ===');

    const existingVersions = ['1.1.0', '1.0.2'];
    const currentVersion = '1.1.0';

    const testVersions = [
        { version: '1.0.1', shouldPass: false, reason: '小于已发布版本中的最小值 1.0.2' },
        { version: '1.0.2', shouldPass: true, reason: '等于已发布版本中的最小值（但不是当前版本）' },
        { version: '1.0.3', shouldPass: true, reason: '大于已发布版本中的最小值 1.0.2' },
        { version: '1.1.0', shouldPass: false, reason: '与当前版本相同' },
        { version: '1.1.1', shouldPass: true, reason: '大于当前版本' },
        { version: '1.2.0', shouldPass: true, reason: '次版本号升级' },
        { version: '2.0.0', shouldPass: true, reason: '主版本号升级' },
    ];

    testVersions.forEach(({ version, shouldPass, reason }) => {
        const result = validateVersionNumber(existingVersions, currentVersion, version);
        const isCorrect = result.isValid === shouldPass;
        const status = isCorrect ? '✓' : '✗';
        console.log(`  ${version}: ${status} ${result.reason} (期望: ${shouldPass ? '通过' : '失败'})`);
    });
}

// 测试场景：已有版本 [2.0.0, 1.5.0, 1.0.0]，当前版本 2.0.0
function testScenario2() {
    console.log('\n=== 测试场景2: 已有版本 [2.0.0, 1.5.0, 1.0.0]，当前版本 2.0.0 ===');

    const existingVersions = ['2.0.0', '1.5.0', '1.0.0'];
    const currentVersion = '2.0.0';

    const testVersions = [
        { version: '0.9.9', shouldPass: false, reason: '小于已发布版本中的最小值 1.0.0' },
        { version: '1.0.0', shouldPass: true, reason: '等于已发布版本中的最小值（但不是当前版本）' },
        { version: '1.0.1', shouldPass: true, reason: '大于已发布版本中的最小值 1.0.0' },
        { version: '1.4.9', shouldPass: true, reason: '大于已发布版本中的最小值 1.0.0' },
        { version: '1.5.0', shouldPass: true, reason: '等于已发布版本（但不是当前版本）' },
        { version: '1.5.1', shouldPass: true, reason: '大于已发布版本 1.5.0' },
        { version: '2.0.0', shouldPass: false, reason: '与当前版本相同' },
        { version: '2.0.1', shouldPass: true, reason: '大于当前版本' },
        { version: '2.1.0', shouldPass: true, reason: '次版本号升级' },
        { version: '3.0.0', shouldPass: true, reason: '主版本号升级' },
    ];

    testVersions.forEach(({ version, shouldPass, reason }) => {
        const result = validateVersionNumber(existingVersions, currentVersion, version);
        const isCorrect = result.isValid === shouldPass;
        const status = isCorrect ? '✓' : '✗';
        console.log(`  ${version}: ${status} ${result.reason} (期望: ${shouldPass ? '通过' : '失败'})`);
    });
}

// 测试场景：第一个版本
function testScenario3() {
    console.log('\n=== 测试场景3: 第一个版本 ===');

    const existingVersions = [];
    const currentVersion = null;

    const testVersions = [
        { version: '0.1.0', shouldPass: true, reason: '第一个版本' },
        { version: '1.0.0', shouldPass: true, reason: '第一个版本' },
        { version: '2.0.0', shouldPass: true, reason: '第一个版本' },
    ];

    testVersions.forEach(({ version, shouldPass, reason }) => {
        const result = validateVersionNumber(existingVersions, currentVersion, version);
        const isCorrect = result.isValid === shouldPass;
        const status = isCorrect ? '✓' : '✗';
        console.log(`  ${version}: ${status} ${result.reason} (期望: ${shouldPass ? '通过' : '失败'})`);
    });
}

// 测试场景：版本号格式验证
function testScenario4() {
    console.log('\n=== 测试场景4: 版本号格式验证 ===');

    const existingVersions = ['1.0.0'];
    const currentVersion = '1.0.0';

    const testVersions = [
        { version: '1.0', shouldPass: false, reason: '格式无效' },
        { version: '1', shouldPass: false, reason: '格式无效' },
        { version: 'v1.0.0', shouldPass: false, reason: '格式无效' },
        { version: '1.0.0.0', shouldPass: false, reason: '格式无效' },
        { version: '1.0.0-beta', shouldPass: false, reason: '格式无效' },
        { version: 'invalid', shouldPass: false, reason: '格式无效' },
        { version: '1.0.0', shouldPass: false, reason: '与当前版本相同' },
        { version: '1.0.1', shouldPass: true, reason: '格式有效且大于当前版本' },
    ];

    testVersions.forEach(({ version, shouldPass, reason }) => {
        const result = validateVersionNumber(existingVersions, currentVersion, version);
        const isCorrect = result.isValid === shouldPass;
        const status = isCorrect ? '✓' : '✗';
        console.log(`  ${version}: ${status} ${result.reason} (期望: ${shouldPass ? '通过' : '失败'})`);
    });
}

// 测试场景：当前版本不是最新版本
function testScenario5() {
    console.log('\n=== 测试场景5: 当前版本不是最新版本 ===');

    const existingVersions = ['2.0.0', '1.5.0', '1.0.0'];
    const currentVersion = '1.5.0'; // 当前版本是 1.5.0，但最新版本是 2.0.0

    const testVersions = [
        { version: '1.0.0', shouldPass: true, reason: '等于已发布版本中的最小值（但不是当前版本）' },
        { version: '1.5.0', shouldPass: false, reason: '与当前版本相同' },
        { version: '1.5.1', shouldPass: true, reason: '大于当前版本' },
        { version: '2.0.0', shouldPass: true, reason: '等于最新版本（但不是当前版本）' },
        { version: '2.0.1', shouldPass: true, reason: '大于最新版本' },
    ];

    testVersions.forEach(({ version, shouldPass, reason }) => {
        const result = validateVersionNumber(existingVersions, currentVersion, version);
        const isCorrect = result.isValid === shouldPass;
        const status = isCorrect ? '✓' : '✗';
        console.log(`  ${version}: ${status} ${result.reason} (期望: ${shouldPass ? '通过' : '失败'})`);
    });
}

// 运行所有测试
function runAllTests() {
    testScenario1();
    testScenario2();
    testScenario3();
    testScenario4();
    testScenario5();
    console.log('\n=== 测试完成 ===');
}

runAllTests();
