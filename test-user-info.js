// 模拟用户信息处理逻辑
function simulateUserInfoHandling() {
    console.log('=== 测试用户信息处理逻辑 ===\n');

    // 模拟当前用户信息
    const currentUser = {
        userId: 1,
        username: 'admin',
    };

    console.log('当前用户信息:');
    console.log(`- 用户ID: ${currentUser.userId}`);
    console.log(`- 用户名: ${currentUser.username}\n`);

    // 模拟创建新应用
    console.log('=== 创建新应用 ===');
    const newApp = {
        name: 'test-app',
        code: 'test-app-code',
        version: '1.0.0',
        description: '测试应用',
        entryPoint: 'index.js',
        packagePath: '/uploads/subapps/test.zip',
        configPath: 'micro.config.json',
        config: { name: 'test-app', version: '1.0.0' },
        fileSize: 1024000,
        checksum: 'abc123def456',
        status: 'active',
        creator: currentUser.username,
        updater: currentUser.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    console.log('新应用信息:');
    console.log(`- 创建者: ${newApp.creator}`);
    console.log(`- 更新者: ${newApp.updater}`);
    console.log(`- 创建时间: ${newApp.createdAt}`);
    console.log(`- 更新时间: ${newApp.updatedAt}\n`);

    // 模拟版本历史记录
    console.log('=== 版本历史记录 ===');
    const versionHistory = {
        subAppId: 1,
        version: '1.0.0',
        description: '测试应用',
        packagePath: '/uploads/subapps/test.zip',
        configPath: 'micro.config.json',
        entryPoint: 'index.js',
        config: { name: 'test-app', version: '1.0.0' },
        fileSize: 1024000,
        checksum: 'abc123def456',
        status: 'active',
        isCurrentVersion: true,
        releaseNotes: '版本 1.0.0 发布',
        creator: currentUser.username,
        updater: currentUser.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    console.log('版本历史信息:');
    console.log(`- 创建者: ${versionHistory.creator}`);
    console.log(`- 更新者: ${versionHistory.updater}`);
    console.log(`- 创建时间: ${versionHistory.createdAt}`);
    console.log(`- 更新时间: ${versionHistory.updatedAt}\n`);

    // 模拟更新现有应用
    console.log('=== 更新现有应用 ===');
    const updatedApp = {
        ...newApp,
        version: '1.1.0',
        description: '测试应用 - 更新版本',
        updater: currentUser.username,
        updatedAt: new Date().toISOString(),
    };

    console.log('更新后的应用信息:');
    console.log(`- 创建者: ${updatedApp.creator}`);
    console.log(`- 更新者: ${updatedApp.updater}`);
    console.log(`- 创建时间: ${updatedApp.createdAt}`);
    console.log(`- 更新时间: ${updatedApp.updatedAt}\n`);

    // 模拟覆盖历史版本
    console.log('=== 覆盖历史版本 ===');
    const overriddenVersion = {
        ...versionHistory,
        version: '1.0.0', // 与历史版本相同
        packagePath: '/uploads/subapps/test-v2.zip',
        fileSize: 2048000,
        checksum: 'def456ghi789',
        releaseNotes: '版本 1.0.0 重新发布',
        updater: currentUser.username,
        updatedAt: new Date().toISOString(),
    };

    console.log('覆盖后的版本信息:');
    console.log(`- 创建者: ${overriddenVersion.creator}`);
    console.log(`- 更新者: ${overriddenVersion.updater}`);
    console.log(`- 创建时间: ${overriddenVersion.createdAt}`);
    console.log(`- 更新时间: ${overriddenVersion.updatedAt}`);
    console.log(`- 发布说明: ${overriddenVersion.releaseNotes}\n`);

    // 模拟无用户信息的情况
    console.log('=== 无用户信息情况 ===');
    const appWithoutUser = {
        ...newApp,
        creator: null,
        updater: null,
    };

    console.log('无用户信息的应用:');
    console.log(`- 创建者: ${appWithoutUser.creator || '未设置'}`);
    console.log(`- 更新者: ${appWithoutUser.updater || '未设置'}\n`);

    console.log('=== 测试完成 ===');
}

// 运行测试
simulateUserInfoHandling();
