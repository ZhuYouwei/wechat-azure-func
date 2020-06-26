import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios from 'axios'
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    //get token
    const tokenRes = await axios.get('https://qyapi.weixin.qq.com/cgi-bin/gettoken', {
        params: {
            corpid: req.body.corpid,
            corpsecret: req.body.corpsecret,
            sid: req.body.sid
        }
    });
    if (!tokenRes.data.access_token || !req.body.sid) {
        context.res = {
            status: 400,
            body: "Please pass corpid, corpsecret, sid in the body"
        };
        return;
    }
    console.log(tokenRes.data);

    // send msg
    const task_id = req.body.sid + '-' + new Date().getTime().toString();
    const date = new Date().toString();
    const sendMsgReq = await axios.post('https://qyapi.weixin.qq.com/cgi-bin/message/send',
        {
            "touser": req.body.sid,
            "msgtype": "taskcard",
            "agentid": 1000011,
            "taskcard": {
                "title": "Disclaimer Reminder",
                "description": `Client：Zhou You<br>Date：${date}<br>Content:Some disclaimer`,
                "task_id": task_id,
                "btn": [
                    {
                        "key": "key111",
                        "name": "Done",
                        "replace_name": "Done",
                        "color": "red",
                        "is_bold": true
                    },
                    {
                        "key": "key222",
                        "name": "Ignore",
                        "replace_name": "Ignore"
                    }
                ]
            },
            "enable_id_trans": 0,
            "enable_duplicate_check": 0,
            "duplicate_check_interval": 1
        },
        {
            params: {
                access_token: tokenRes.data.access_token
            }
        }
    )
    context.res = {
        status: 200,
        body: sendMsgReq.data
    };
    return;

};

export default httpTrigger;
