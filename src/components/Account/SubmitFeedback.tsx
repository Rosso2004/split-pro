import React, { useState } from 'react';
import { AppDrawer } from '../ui/drawer';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { api } from '~/utils/api';
import { Textarea } from '../ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const SubmitFeedback: React.FC = () => {
  const submitFeedbackMutation = api.user.submitFeedback.useMutation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { t } = useTranslation('account_page');

  const feedbackSchema = z.object({
    feedback: z
        .string({ required_error: t('ui/submit_feedback_details/errors/feedback_required') })
        .min(10, { message: t('ui/submit_feedback_details/errors/feedback_min_length') }),
  });

  const feedbackForm = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
  });

  async function onGroupSubmit(values: z.infer<typeof feedbackSchema>) {
    try {
      await submitFeedbackMutation.mutateAsync({ feedback: values.feedback });
      feedbackForm.reset();
      toast.success(t('ui/submit_feedback_details/messages/submit_success'), { duration: 1500 });
    } catch (e) {
      toast.error(t('ui/submit_feedback_details/messages/submit_error'));
    }
    setFeedbackOpen(false);
  }

  return (
    <AppDrawer
      trigger={
        <div className="flex w-full justify-between px-0 py-2 text-[16px] font-medium text-gray-300 hover:text-foreground/80">
          <div className="flex items-center gap-4 text-[16px]">
            <MessageSquare className="h-5 w-5 text-green-500" />
            {t('ui/submit_feedback')}
          </div>
          <ChevronRight className="h-6x w-6 text-gray-500" />
        </div>
      }
      open={feedbackOpen}
      onOpenChange={setFeedbackOpen}
      onClose={() => setFeedbackOpen(false)}
      leftAction={t('ui/submit_feedback_details/close')}
      title={t('ui/submit_feedback_details/title')}
      className="h-[70vh]"
      shouldCloseOnAction={false}
      actionTitle={t('ui/submit_feedback_details/submit')}
      actionOnClick={async () => {
        await feedbackForm.handleSubmit(onGroupSubmit)();
      }}
    >
      <div>
        <Form {...feedbackForm}>
          <form
            onSubmit={feedbackForm.handleSubmit(onGroupSubmit)}
            className="mt-4 flex w-full items-start gap-4"
          >
            <FormField
              control={feedbackForm.control}
              name="feedback"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Textarea
                      className="text-lg placeholder:text-sm"
                      rows={5}
                      placeholder={t('ui/submit_feedback_details/placeholder')}
                      {...field}
                    ></Textarea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </AppDrawer>
  );
};
