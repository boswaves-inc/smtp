import { Context, KafkaMessage } from "~/types";

export default ({ logger }: Context) => {

    return ({ }: KafkaMessage) => {
        logger.warn('email-scheduled')
    }
}