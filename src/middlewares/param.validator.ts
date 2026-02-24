import { ParamValidatorSchema } from "./template.validator";

export const templateCustomerIdParamSchema: ParamValidatorSchema = {
    customer_id: { required: true, min: 36, max: 36 }
}

export const templateEventIdParamSchema: ParamValidatorSchema = {
    event_id: { required: true, min: 36, max: 36 }
}