package com.cog.jack.testapp;

import android.view.View;
import android.view.ViewGroup;

import com.google.android.glass.widget.CardBuilder;
import com.google.android.glass.widget.CardScrollAdapter;

import java.util.ArrayList;
import java.util.List;

public class CardAdapter extends CardScrollAdapter {
    private List<CardBuilder> mCards;

    public CardAdapter(CardBuilder initial) {
        mCards = new ArrayList<CardBuilder>();
        mCards.add(initial);
    }

    @Override
    public int getPosition(Object item) {
        return mCards.indexOf(item);
    }

    @Override
    public int getCount() {
        return mCards.size();
    }

    @Override
    public Object getItem(int position) {
        return mCards.get(position);
    }

    @Override
    public int getViewTypeCount() {
        return CardBuilder.getViewTypeCount();
    }

    @Override
    public int getItemViewType(int position){
        return mCards.get(position).getItemViewType();
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        return mCards.get(position).getView(convertView, parent);
    }

    public void addCard(CardBuilder card) {
        mCards.add(1, card);
    }
}