import readlineSync from 'readline-sync';

function testPasswordInput() {
    try {
        console.log('测试密码输入功能...');

        // 测试普通输入
        const username = readlineSync.question('请输入用户名: ');
        console.log(`用户名: ${username}`);

        // 测试密码输入（隐藏回显）
        const password = readlineSync.question('请输入密码: ', {
            hideEchoBack: true,
            mask: '*',
        });

        console.log(`\n密码长度: ${password.length}`);
        console.log(`密码内容: ${password}`);
    } catch (error) {
        console.error('测试失败:', error);
    }
}

testPasswordInput();
