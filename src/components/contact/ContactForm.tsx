'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import { contactSchema, type ContactInput, type ContactOutput } from '@/lib/validations';
import { submitContact } from '@/lib/actions/contacts';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function ContactForm() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(false);

  const form = useForm<ContactInput, unknown, ContactOutput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', phone: '', email: '', message: '', tag: 'GENERAL' },
  });

  async function onSubmit(data: ContactOutput) {
    setServerError(false);
    const result = await submitContact(data);
    if (result.success) {
      setSubmitted(true);
      form.reset();
    } else {
      setServerError(true);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-secondary text-center text-text-primary">{t('success')}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input
                    className="h-12 rounded-full bg-white px-5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone')}</FormLabel>
                <FormControl>
                  <Input
                    className="h-12 rounded-full bg-white px-5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input type="email" className="bg-white" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('message')}</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[140px] rounded-2xl bg-white px-5 py-3"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col items-center gap-3">
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full px-10 sm:w-auto sm:px-16"
            disabled={form.formState.isSubmitting}
          >
            {t('send')}
          </Button>
          {serverError && (
            <p className="text-body-sm text-destructive">{t('error')}</p>
          )}
        </div>
      </form>
    </Form>
  );
}
