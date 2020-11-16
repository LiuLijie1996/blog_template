interface Options {
    url: string;//请求地址
    method?: string;//请求方式
    data?: {//发送的数据
        [key: string]: any,
    }
}

export default function (options: Options) {
    let method = options.method ? options.method : 'post';
    return new Promise(resolve => {
        $.ajax({
            url: options.url,
            method,
            data: options.data,
        }).then(res => {
            resolve(res);
        });
    })
}